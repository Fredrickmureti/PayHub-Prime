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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (!user) {
      throw new Error('Unauthorized');
    }

    const url = new URL(req.url);
    const transactionId = url.pathname.split('/').pop();

    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    // Get transaction with merchant check
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select(`
        *,
        payment_sessions(callback_url),
        merchants!inner(user_id)
      `)
      .eq('id', transactionId)
      .eq('merchants.user_id', user.id)
      .single();

    if (txError || !transaction) {
      throw new Error('Transaction not found or unauthorized');
    }

    if (!transaction.payment_sessions?.callback_url) {
      throw new Error('No callback URL configured for this transaction');
    }

    // Invoke webhook forwarder
    const { data: webhookResult, error: webhookError } = await supabase.functions.invoke(
      'forward-webhook',
      {
        body: {
          transaction_id: transaction.id,
          merchant_id: transaction.merchant_id,
          webhook_url: transaction.payment_sessions.callback_url,
          event: transaction.status === 'completed' ? 'payment.completed' : 'payment.failed',
          data: {
            transaction_id: transaction.id,
            status: transaction.status,
            amount: transaction.amount,
            currency: transaction.currency,
            payment_method: transaction.payment_method,
            receipt_number: transaction.receipt_number,
          },
        },
      }
    );

    if (webhookError) {
      throw webhookError;
    }

    console.log('Webhook retry result:', webhookResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook retry initiated',
        result: webhookResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error retrying webhook:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
