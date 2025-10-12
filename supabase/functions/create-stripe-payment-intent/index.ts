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
    console.log('Creating Stripe payment intent for session:', sessionId);

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Payment session not found');
    }

    // Get merchant Stripe config
    const { data: config, error: configError } = await supabase
      .from('merchant_payment_configs')
      .select('*')
      .eq('merchant_id', session.merchant_id)
      .eq('payment_method', 'credit_card')
      .single();

    if (configError || !config || !config.is_active) {
      throw new Error('Card payment configuration not found or not active');
    }

    // Only proceed if Stripe is the processor
    if (config.card_processor !== 'stripe') {
      throw new Error('Only Stripe is currently supported for card processing');
    }

    // Create transaction record
    const { data: transaction, error: txnError } = await supabase
      .from('transactions')
      .insert({
        merchant_id: session.merchant_id,
        session_id: session.id,
        amount: session.amount,
        currency: session.currency,
        payment_method: 'credit_card',
        status: 'processing',
        description: session.description,
        customer_email: session.customer_email,
      })
      .select()
      .single();

    if (txnError) {
      throw new Error('Failed to create transaction');
    }

    // Create Stripe Payment Intent
    console.log('Creating Stripe Payment Intent...');
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.card_secret_key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(session.amount * 100).toString(), // Convert to cents
        currency: session.currency.toLowerCase(),
        description: session.description || 'Payment',
        'metadata[transaction_id]': transaction.id,
        'metadata[session_id]': sessionId,
        'metadata[merchant_id]': session.merchant_id,
      }).toString(),
    });

    const paymentIntent = await stripeResponse.json();
    console.log('Stripe Payment Intent created:', paymentIntent.id);

    if (!stripeResponse.ok) {
      await supabase
        .from('transactions')
        .update({ status: 'failed', metadata: paymentIntent })
        .eq('id', transaction.id);
      
      throw new Error(paymentIntent.error?.message || 'Failed to create payment intent');
    }

    // Update transaction with Stripe Payment Intent ID
    await supabase
      .from('transactions')
      .update({ 
        provider_reference: paymentIntent.id,
        metadata: {
          payment_intent_id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
        },
      })
      .eq('id', transaction.id);

    // Update session
    await supabase
      .from('payment_sessions')
      .update({
        payment_method: 'credit_card',
        status: 'processing',
      })
      .eq('id', sessionId);

    return new Response(
      JSON.stringify({
        success: true,
        clientSecret: paymentIntent.client_secret,
        publishableKey: config.card_api_key,
        transactionId: transaction.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error creating Stripe payment intent:', error);
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
