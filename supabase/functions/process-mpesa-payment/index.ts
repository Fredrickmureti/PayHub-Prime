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

    const { sessionId, phoneNumber } = await req.json();

    console.log('Processing M-Pesa payment for session:', sessionId);

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Payment session not found');
    }

    // Get merchant M-Pesa config
    const { data: config, error: configError } = await supabase
      .from('merchant_payment_configs')
      .select('*')
      .eq('merchant_id', session.merchant_id)
      .eq('payment_method', 'mpesa')
      .single();

    if (configError || !config) {
      throw new Error('M-Pesa configuration not found');
    }

    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = btoa(`${config.mpesa_shortcode}${config.mpesa_passkey}${timestamp}`);

    // Get OAuth token
    const authString = btoa(`${config.mpesa_consumer_key}:${config.mpesa_consumer_secret}`);
    const baseUrl = config.is_sandbox 
      ? 'https://sandbox.safaricom.co.ke' 
      : 'https://api.safaricom.co.ke';

    console.log('Getting OAuth token...');
    const authResponse = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
      },
    });

    if (!authResponse.ok) {
      throw new Error('Failed to get OAuth token');
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Format phone number (remove leading 0, add 254)
    let formattedPhone = phoneNumber.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Create transaction record
    const { data: transaction, error: txnError } = await supabase
      .from('transactions')
      .insert({
        merchant_id: session.merchant_id,
        session_id: session.id,
        amount: session.amount,
        currency: session.currency,
        payment_method: 'mpesa',
        customer_phone: formattedPhone,
        status: 'processing',
        description: session.description,
      })
      .select()
      .single();

    if (txnError) {
      throw new Error('Failed to create transaction');
    }

    // Update session
    await supabase
      .from('payment_sessions')
      .update({
        payment_method: 'mpesa',
        customer_phone: formattedPhone,
        status: 'processing',
      })
      .eq('id', sessionId);

    // Process templates for AccountReference and TransactionDesc
    const accountRefTemplate = config.mpesa_account_reference_template || '{transaction_id}';
    const transDescTemplate = config.mpesa_transaction_desc_template || '{description}';
    
    const templateVars = {
      transaction_id: transaction.id,
      session_id: session.id,
      merchant_id: session.merchant_id,
      amount: session.amount.toString(),
      phone: formattedPhone,
      description: session.description || 'Payment',
    };
    
    const accountReference = accountRefTemplate.replace(/\{(\w+)\}/g, (_, key) => 
      templateVars[key as keyof typeof templateVars] || ''
    ).substring(0, 12); // M-Pesa limit
    
    const transactionDesc = transDescTemplate.replace(/\{(\w+)\}/g, (_, key) => 
      templateVars[key as keyof typeof templateVars] || ''
    ).substring(0, 13); // M-Pesa limit

    // Initiate STK Push
    console.log('Initiating STK Push with AccountReference:', accountReference);
    const stkPushResponse = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: config.mpesa_shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(session.amount),
        PartyA: formattedPhone,
        PartyB: config.mpesa_shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: config.mpesa_callback_url,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      }),
    });

    const stkData = await stkPushResponse.json();
    console.log('STK Push response:', stkData);

    if (stkData.ResponseCode !== '0') {
      // Update transaction status
      await supabase
        .from('transactions')
        .update({ 
          status: 'failed',
          metadata: stkData,
        })
        .eq('id', transaction.id);

      throw new Error(stkData.ResponseDescription || 'STK Push failed');
    }

    // Update transaction with M-Pesa reference
    await supabase
      .from('transactions')
      .update({ 
        status: 'awaiting_confirmation',
        provider_reference: stkData.CheckoutRequestID,
        metadata: stkData,
      })
      .eq('id', transaction.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'STK Push sent successfully',
        checkoutRequestId: stkData.CheckoutRequestID,
        transactionId: transaction.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing M-Pesa payment:', error);
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
