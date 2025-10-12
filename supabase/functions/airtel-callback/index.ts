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

    const callbackData = await req.json();
    console.log('Airtel Money callback received:', JSON.stringify(callbackData, null, 2));

    // Airtel callback structure varies, handle multiple formats
    const transactionId = callbackData.transaction?.id || 
                         callbackData.data?.transaction?.id ||
                         callbackData.reference;

    const status = callbackData.transaction?.status || 
                  callbackData.status?.code ||
                  callbackData.status;

    // Find transaction by provider_reference or id
    const { data: transaction, error: findError } = await supabase
      .from('transactions')
      .select('*')
      .or(`provider_reference.eq.${transactionId},id.eq.${transactionId}`)
      .single();

    if (findError || !transaction) {
      console.error('Transaction not found for Airtel transaction:', transactionId);
      return new Response(
        JSON.stringify({ 
          status: 'ACCEPTED',
          message: 'Transaction not found but callback accepted' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let txnStatus = 'failed';
    let verificationStatus = 'unverified';
    let receiptNumber = null;
    let transactionTimestamp = null;
    let amountPaid = null;

    // Airtel success codes: 'TS' (Transaction Successful), 'TIP' (Transaction In Progress)
    if (status === 'TS' || status === '200' || status === 'SUCCESS') {
      txnStatus = 'completed';
      
      // Extract transaction details
      const transactionData = callbackData.transaction || callbackData.data?.transaction || {};
      
      receiptNumber = transactionData.airtel_money_id || 
                     transactionData.id ||
                     callbackData.reference;
      
      transactionTimestamp = transactionData.created_at || 
                            callbackData.timestamp ||
                            new Date().toISOString();
      
      amountPaid = parseFloat(transactionData.amount || callbackData.amount || 0);
      
      // Verify amount
      if (amountPaid && Math.abs(amountPaid - transaction.amount) < 0.01) {
        verificationStatus = 'verified';
      } else if (amountPaid) {
        verificationStatus = 'mismatched';
        console.warn(`Amount mismatch: Expected ${transaction.amount}, Got ${amountPaid}`);
      }
    } else if (status === 'TF' || status === 'FAILED') {
      // Transaction Failed
      txnStatus = 'failed';
    } else if (status === 'TIP' || status === 'PENDING') {
      // Transaction In Progress
      txnStatus = 'processing';
    } else {
      // Unknown status, mark as failed
      txnStatus = 'failed';
    }

    console.log(`Updating transaction ${transaction.id} to status: ${txnStatus}`);

    // Update transaction with ALL data
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: txnStatus,
        provider_reference: receiptNumber || transaction.provider_reference,
        receipt_number: receiptNumber,
        transaction_timestamp: transactionTimestamp,
        verification_status: verificationStatus,
        metadata: {
          ...transaction.metadata,
          callback: callbackData,
          airtel_receipt: receiptNumber,
          transaction_timestamp: transactionTimestamp,
          amount_paid: amountPaid,
          status_code: status,
        },
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
    }

    // Update payment session
    if (transaction.session_id) {
      await supabase
        .from('payment_sessions')
        .update({ status: txnStatus })
        .eq('id', transaction.session_id);
    }

    // Forward webhook to merchant if callback_url exists and payment is completed
    if (txnStatus === 'completed' && transaction.session_id) {
      const { data: session } = await supabase
        .from('payment_sessions')
        .select('callback_url')
        .eq('id', transaction.session_id)
        .single();

      if (session?.callback_url) {
        // Trigger webhook forwarding asynchronously
        await supabase.functions.invoke('forward-webhook', {
          body: {
            transaction_id: transaction.id,
            merchant_id: transaction.merchant_id,
            webhook_url: session.callback_url,
            event: 'payment.completed',
            data: {
              transaction_id: transaction.id,
              session_id: transaction.session_id,
              status: txnStatus,
              amount: transaction.amount,
              currency: transaction.currency,
              payment_method: 'airtel_money',
              receipt_number: receiptNumber,
              transaction_timestamp: transactionTimestamp,
              customer_phone: transaction.customer_phone,
              verification_status: verificationStatus,
              metadata: {
                airtel_receipt: receiptNumber,
                status_code: status,
              },
            },
          },
        }).catch(err => console.error('Webhook forwarding error:', err));
      }
    }

    return new Response(
      JSON.stringify({ 
        status: 'ACCEPTED',
        message: 'Callback processed successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing Airtel Money callback:', error);
    return new Response(
      JSON.stringify({ 
        status: 'ERROR',
        message: error.message 
      }),
      { 
        status: 200, // Return 200 even on error so Airtel doesn't retry
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
