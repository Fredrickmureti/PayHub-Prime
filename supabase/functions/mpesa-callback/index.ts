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
    console.log('M-Pesa callback received:', JSON.stringify(callbackData, null, 2));

    const { Body } = callbackData;
    const { stkCallback } = Body;

    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;

    // Find transaction by CheckoutRequestID
    const { data: transaction, error: findError } = await supabase
      .from('transactions')
      .select('*')
      .eq('provider_reference', CheckoutRequestID)
      .single();

    if (findError || !transaction) {
      console.error('Transaction not found for CheckoutRequestID:', CheckoutRequestID);
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let status = 'failed';
    let mpesaReceiptNumber = null;
    let transactionDate = null;
    let amount = null;
    let phoneNumber = null;
    let balanceBefore = null;
    let balanceAfter = null;
    let verificationStatus = 'unverified';

    if (ResultCode === 0) {
      // Payment successful
      status = 'completed';
      
      // Extract ALL callback metadata
      if (CallbackMetadata && CallbackMetadata.Item) {
        const items = CallbackMetadata.Item;
        
        const receiptItem = items.find((item: any) => item.Name === 'MpesaReceiptNumber');
        const dateItem = items.find((item: any) => item.Name === 'TransactionDate');
        const amountItem = items.find((item: any) => item.Name === 'Amount');
        const phoneItem = items.find((item: any) => item.Name === 'PhoneNumber');
        
        if (receiptItem) mpesaReceiptNumber = receiptItem.Value;
        if (dateItem) {
          transactionDate = dateItem.Value;
          // Convert M-Pesa timestamp (YYYYMMDDHHmmss) to ISO
          const dateStr = dateItem.Value.toString();
          if (dateStr.length === 14) {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            const hour = dateStr.substring(8, 10);
            const minute = dateStr.substring(10, 12);
            const second = dateStr.substring(12, 14);
            transactionDate = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
          }
        }
        if (amountItem) {
          amount = parseFloat(amountItem.Value);
          // Verify amount matches transaction amount
          if (Math.abs(amount - transaction.amount) < 0.01) {
            verificationStatus = 'verified';
          } else {
            verificationStatus = 'mismatched';
            console.warn(`Amount mismatch: Expected ${transaction.amount}, Got ${amount}`);
          }
        }
        if (phoneItem) phoneNumber = phoneItem.Value;
      }
    } else if (ResultCode === 1032) {
      // User cancelled
      status = 'cancelled';
    } else {
      // Other failure
      status = 'failed';
    }

    console.log(`Updating transaction ${transaction.id} to status: ${status}`);

    // Update transaction with ALL data
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status,
        provider_reference: mpesaReceiptNumber || CheckoutRequestID,
        receipt_number: mpesaReceiptNumber,
        transaction_timestamp: transactionDate,
        customer_phone: phoneNumber || transaction.customer_phone,
        verification_status: verificationStatus,
        metadata: {
          ...transaction.metadata,
          callback: callbackData,
          mpesa_receipt: mpesaReceiptNumber,
          transaction_date: transactionDate,
          result_desc: ResultDesc,
          amount_paid: amount,
          phone_number: phoneNumber,
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
        .update({ status })
        .eq('id', transaction.session_id);
    }

    // Forward webhook to merchant if callback_url exists
    if (status === 'completed' && transaction.session_id) {
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
              status,
              amount: transaction.amount,
              currency: transaction.currency,
              payment_method: 'mpesa',
              receipt_number: mpesaReceiptNumber,
              transaction_timestamp: transactionDate,
              customer_phone: phoneNumber,
              verification_status: verificationStatus,
              metadata: {
                mpesa_receipt: mpesaReceiptNumber,
                result_desc: ResultDesc,
              },
            },
          },
        }).catch(err => console.error('Webhook forwarding error:', err));
      }
    }

    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing M-Pesa callback:', error);
    return new Response(
      JSON.stringify({ ResultCode: 1, ResultDesc: 'Error processing callback' }),
      { 
        status: 200, // M-Pesa expects 200 even on error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
