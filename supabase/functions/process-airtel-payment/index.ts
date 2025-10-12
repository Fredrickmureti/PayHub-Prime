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

    console.log('Processing Airtel Money payment for session:', sessionId);

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Payment session not found');
    }

    // Get merchant Airtel Money config
    const { data: config, error: configError } = await supabase
      .from('merchant_payment_configs')
      .select('*')
      .eq('merchant_id', session.merchant_id)
      .eq('payment_method', 'airtel_money')
      .single();

    if (configError || !config) {
      throw new Error('Airtel Money configuration not found');
    }

    // Determine base URL based on sandbox mode
    const baseUrl = config.is_sandbox 
      ? 'https://openapiuat.airtel.africa' 
      : 'https://openapi.airtel.africa';

    // Step 1: Get OAuth token
    console.log('Getting OAuth token...');
    const authResponse = await fetch(`${baseUrl}/auth/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.airtel_client_id,
        client_secret: config.airtel_client_secret,
        grant_type: 'client_credentials',
      }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.text();
      throw new Error(`Failed to get OAuth token: ${errorData}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Format phone number (remove leading 0, ensure country code)
    let formattedPhone = phoneNumber.replace(/\s+/g, '');
    
    // Determine country and format accordingly
    let countryCode = 'KE'; // Default Kenya
    let currencyCode = session.currency || 'KES';
    
    // Kenya: 254, Uganda: 256, Tanzania: 255, Zambia: 260, etc.
    if (formattedPhone.startsWith('0')) {
      // Assume Kenya if starting with 0
      formattedPhone = '254' + formattedPhone.substring(1);
      countryCode = 'KE';
      currencyCode = 'KES';
    } else if (formattedPhone.startsWith('254')) {
      countryCode = 'KE';
      currencyCode = 'KES';
    } else if (formattedPhone.startsWith('256')) {
      countryCode = 'UG';
      currencyCode = 'UGX';
    } else if (formattedPhone.startsWith('255')) {
      countryCode = 'TZ';
      currencyCode = 'TZS';
    } else if (formattedPhone.startsWith('260')) {
      countryCode = 'ZM';
      currencyCode = 'ZMW';
    }

    // Create transaction record
    const { data: transaction, error: txnError } = await supabase
      .from('transactions')
      .insert({
        merchant_id: session.merchant_id,
        session_id: session.id,
        amount: session.amount,
        currency: currencyCode,
        payment_method: 'airtel_money',
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
        payment_method: 'airtel_money',
        customer_phone: formattedPhone,
        status: 'processing',
        currency: currencyCode,
      })
      .eq('id', sessionId);

    // Step 2: Initiate Collection Request
    console.log('Initiating Airtel Money collection...');
    const collectionResponse = await fetch(`${baseUrl}/merchant/v2/payments/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Country': countryCode,
        'X-Currency': currencyCode,
      },
      body: JSON.stringify({
        reference: transaction.id,
        subscriber: {
          country: countryCode,
          currency: currencyCode,
          msisdn: formattedPhone,
        },
        transaction: {
          amount: session.amount,
          country: countryCode,
          currency: currencyCode,
          id: transaction.id,
        },
      }),
    });

    const collectionData = await collectionResponse.json();
    console.log('Airtel Money collection response:', collectionData);

    // Check response status
    if (collectionData.status?.code !== '200' && collectionData.status?.code !== 'TS') {
      // Update transaction status
      await supabase
        .from('transactions')
        .update({ 
          status: 'failed',
          metadata: collectionData,
        })
        .eq('id', transaction.id);

      throw new Error(
        collectionData.status?.message || 
        collectionData.message || 
        'Airtel Money collection failed'
      );
    }

    // Extract transaction ID from response
    const airtelTransactionId = collectionData.data?.transaction?.id || 
                                collectionData.transaction?.id;

    // Update transaction with Airtel reference
    await supabase
      .from('transactions')
      .update({ 
        status: 'awaiting_confirmation',
        provider_reference: airtelTransactionId,
        metadata: collectionData,
      })
      .eq('id', transaction.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Airtel Money push sent successfully. Please check your phone.',
        transactionId: transaction.id,
        airtelTransactionId: airtelTransactionId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing Airtel Money payment:', error);
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
