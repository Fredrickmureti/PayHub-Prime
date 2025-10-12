import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.text();
    const event = JSON.parse(payload);
    
    console.log('Stripe webhook received:', event.type);

    const paymentIntent = event.data.object;
    const transactionId = paymentIntent.metadata?.transaction_id;

    if (!transactionId) {
      console.log('No transaction ID in metadata');
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get transaction
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (!transaction) {
      console.log('Transaction not found:', transactionId);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const charge = paymentIntent.charges?.data?.[0];
        const receiptUrl = charge?.receipt_url;
        const receiptNumber = charge?.id || paymentIntent.id;

        await supabase
          .from('transactions')
          .update({
            status: 'completed',
            receipt_number: receiptNumber,
            verification_status: 'verified',
            transaction_timestamp: new Date(paymentIntent.created * 1000).toISOString(),
            metadata: {
              ...transaction.metadata,
              payment_intent: paymentIntent,
              receipt_url: receiptUrl,
              card_brand: charge?.payment_method_details?.card?.brand,
              card_last4: charge?.payment_method_details?.card?.last4,
            },
          })
          .eq('id', transactionId);

        // Update session
        if (transaction.session_id) {
          await supabase
            .from('payment_sessions')
            .update({ status: 'completed' })
            .eq('id', transaction.session_id);

          // Forward webhook
          const { data: session } = await supabase
            .from('payment_sessions')
            .select('callback_url')
            .eq('id', transaction.session_id)
            .single();

          if (session?.callback_url) {
            await supabase.functions.invoke('forward-webhook', {
              body: {
                transaction_id: transactionId,
                merchant_id: transaction.merchant_id,
                webhook_url: session.callback_url,
                event: 'payment.completed',
                data: {
                  transaction_id: transactionId,
                  status: 'completed',
                  amount: transaction.amount,
                  currency: transaction.currency,
                  payment_method: 'credit_card',
                  receipt_number: receiptNumber,
                  receipt_url: receiptUrl,
                },
              },
            }).catch(err => console.error('Webhook error:', err));
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        await supabase
          .from('transactions')
          .update({
            status: 'failed',
            metadata: {
              ...transaction.metadata,
              payment_intent: paymentIntent,
              error: paymentIntent.last_payment_error,
            },
          })
          .eq('id', transactionId);

        if (transaction.session_id) {
          await supabase
            .from('payment_sessions')
            .update({ status: 'failed' })
            .eq('id', transaction.session_id);
        }
        break;
      }

      case 'charge.refunded': {
        await supabase
          .from('transactions')
          .update({
            status: 'refunded',
            metadata: {
              ...transaction.metadata,
              refund: event.data.object,
            },
          })
          .eq('id', transactionId);
        break;
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing Stripe webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
