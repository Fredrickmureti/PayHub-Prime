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

    const { sessionId } = await req.json();
    console.log('Creating PayPal order for session:', sessionId);

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Payment session not found');
    }

    // Get merchant PayPal config
    const { data: config, error: configError } = await supabase
      .from('merchant_payment_configs')
      .select('*')
      .eq('merchant_id', session.merchant_id)
      .eq('payment_method', 'paypal')
      .single();

    if (configError || !config || !config.is_active) {
      throw new Error('PayPal configuration not found or not active');
    }

    // Check if currency is supported by PayPal, if not convert to USD
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CHF', 'HKD', 'SGD', 'SEK', 'DKK', 'NOK', 'NZD', 'THB', 'PHP', 'MYR', 'BRL', 'TWD', 'ILS', 'MXN', 'CZK', 'HUF', 'PLN'];
    let paypalCurrency = session.currency.toUpperCase();
    let paypalAmount = session.amount;
    
    if (!supportedCurrencies.includes(paypalCurrency)) {
      console.log(`Currency ${paypalCurrency} not supported by PayPal, converting to USD`);
      
      // Fetch exchange rate to USD
      try {
        const exchangeResponse = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${paypalCurrency}`
        );
        
        if (exchangeResponse.ok) {
          const exchangeData = await exchangeResponse.json();
          const rateToUSD = exchangeData.rates.USD;
          paypalAmount = session.amount * rateToUSD;
          paypalCurrency = 'USD';
          console.log(`Converted ${session.amount} ${session.currency} to ${paypalAmount} USD (rate: ${rateToUSD})`);
        } else {
          throw new Error('Failed to fetch exchange rate');
        }
      } catch (conversionError) {
        console.error('Currency conversion error:', conversionError);
        throw new Error(`Unable to process payment in ${session.currency}. Please contact support.`);
      }
    }

    const baseUrl = config.is_sandbox 
      ? 'https://api-m.sandbox.paypal.com' 
      : 'https://api-m.paypal.com';

    // Step 1: Get OAuth token
    console.log('Getting PayPal OAuth token...');
    const authString = btoa(`${config.paypal_client_id}:${config.paypal_secret}`);
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.text();
      throw new Error(`Failed to get PayPal token: ${errorData}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Create transaction record
    const { data: transaction, error: txnError } = await supabase
      .from('transactions')
      .insert({
        merchant_id: session.merchant_id,
        session_id: session.id,
        amount: session.amount,
        currency: session.currency,
        payment_method: 'paypal',
        status: 'processing',
        description: session.description,
        customer_email: session.customer_email,
      })
      .select()
      .single();

    if (txnError) {
      throw new Error('Failed to create transaction');
    }

    // Get merchant business details
    const { data: merchant } = await supabase
      .from('merchants')
      .select('business_name')
      .eq('id', session.merchant_id)
      .single();

    const businessName = merchant?.business_name || 'Your Business';
    const checkoutUrl = session.checkout_url || `${Deno.env.get('SUPABASE_URL').replace('https://sjoroqyuvrsqvlurtdod.supabase.co', 'https://sjoroqyuvrsqvlurtdod.lovable.app')}/checkout/${sessionId}`;

    // Step 2: Create PayPal order
    console.log('Creating PayPal order...');
    const orderPayload: any = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: transaction.id,
        description: session.description || 'Payment',
        amount: {
          currency_code: paypalCurrency,
          value: paypalAmount.toFixed(2),
        },
      }],
      application_context: {
        brand_name: businessName,
        landing_page: 'LOGIN',
        user_action: 'PAY_NOW',
        return_url: checkoutUrl,
        cancel_url: checkoutUrl,
      },
    };

    // Pre-fill payer email if available
    if (session.customer_email) {
      orderPayload.payer = {
        email_address: session.customer_email,
      };
    }

    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': transaction.id, // Idempotency key
      },
      body: JSON.stringify(orderPayload),
    });

    const orderData = await orderResponse.json();
    console.log('PayPal order created:', orderData);

    if (!orderResponse.ok) {
      await supabase
        .from('transactions')
        .update({ status: 'failed', metadata: orderData })
        .eq('id', transaction.id);
      
      throw new Error(orderData.message || 'Failed to create PayPal order');
    }

    // Update transaction with PayPal order ID
    await supabase
      .from('transactions')
      .update({ 
        provider_reference: orderData.id,
        metadata: orderData,
      })
      .eq('id', transaction.id);

    // Update session
    await supabase
      .from('payment_sessions')
      .update({
        payment_method: 'paypal',
        status: 'processing',
      })
      .eq('id', sessionId);

    // Extract approval URL
    const approvalUrl = orderData.links?.find((link: any) => link.rel === 'approve')?.href;

    return new Response(
      JSON.stringify({
        success: true,
        orderId: orderData.id,
        approvalUrl,
        transactionId: transaction.id,
        currency: paypalCurrency,
        amount: paypalAmount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
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
