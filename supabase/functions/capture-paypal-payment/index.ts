import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { orderId, sessionId } = await req.json();
    console.log('Capturing PayPal payment for order:', orderId);

    // Get session
    const { data: session } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) {
      throw new Error('Session not found');
    }

    // Get transaction
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('provider_reference', orderId)
      .single();

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Get PayPal config
    const { data: config } = await supabase
      .from('merchant_payment_configs')
      .select('*')
      .eq('merchant_id', session.merchant_id)
      .eq('payment_method', 'paypal')
      .single();

    if (!config) {
      throw new Error('PayPal config not found');
    }

    const baseUrl = config.is_sandbox 
      ? 'https://api-m.sandbox.paypal.com' 
      : 'https://api-m.paypal.com';

    // Get OAuth token
    const authString = btoa(`${config.paypal_client_id}:${config.paypal_secret}`);
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Capture the order
    console.log('Capturing PayPal order...');
    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureResponse.json();
    console.log('PayPal capture response:', captureData);

    if (!captureResponse.ok || captureData.status !== 'COMPLETED') {
      await supabase
        .from('transactions')
        .update({ 
          status: 'failed',
          metadata: { ...transaction.metadata, capture: captureData },
        })
        .eq('id', transaction.id);

      throw new Error(captureData.message || 'Failed to capture payment');
    }

    // Extract payment details
    const purchase = captureData.purchase_units?.[0];
    const capture = purchase?.payments?.captures?.[0];
    const receiptId = capture?.id || orderId;
    const payer = captureData.payer;
    
    // Extract payer information
    const payerEmail = payer?.email_address;
    const payerName = payer?.name 
      ? `${payer.name.given_name || ''} ${payer.name.surname || ''}`.trim()
      : null;
    const payerId = payer?.payer_id;

    // Update transaction as completed
    await supabase
      .from('transactions')
      .update({
        status: 'completed',
        receipt_number: receiptId,
        verification_status: 'verified',
        transaction_timestamp: new Date().toISOString(),
        customer_email: payerEmail || transaction.customer_email,
        customer_name: payerName || transaction.customer_name,
        metadata: {
          ...transaction.metadata,
          capture: captureData,
          paypal_transaction_id: receiptId,
          paypal_order_id: orderId,
          payer_id: payerId,
          payer_email: payerEmail,
          payment_status: captureData.status,
        },
      })
      .eq('id', transaction.id);

    // Update session
    await supabase
      .from('payment_sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId);

    // Forward webhook if configured
    if (session.callback_url) {
      await supabase.functions.invoke('forward-webhook', {
        body: {
          transaction_id: transaction.id,
          merchant_id: session.merchant_id,
          webhook_url: session.callback_url,
          event: 'payment.completed',
          data: {
            transaction_id: transaction.id,
            session_id: sessionId,
            status: 'completed',
            amount: transaction.amount,
            currency: transaction.currency,
            payment_method: 'paypal',
            receipt_number: receiptId,
            customer_email: payer?.email_address,
          },
        },
      }).catch(err => console.error('Webhook error:', err));
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: 'completed',
        receiptNumber: receiptId,
        transactionId: transaction.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error capturing PayPal payment:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
