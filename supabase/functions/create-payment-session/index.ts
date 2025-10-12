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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Extract API key from Bearer token
    const apiKey = authHeader.replace('Bearer ', '');

    // Verify merchant API key
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, business_name, is_active')
      .eq('api_key', apiKey)
      .single();

    if (merchantError || !merchant) {
      throw new Error('Invalid API key');
    }

    if (!merchant.is_active) {
      throw new Error('Merchant account is not active');
    }

    const {
      amount,
      currency = 'KES',
      description,
      callback_url,
      success_redirect_url,
      failure_redirect_url,
      cancel_redirect_url,
      customer_email,
      customer_phone,
      payment_method,
    } = await req.json();

    // Validate required fields
    if (!amount || amount <= 0) {
      throw new Error('Valid amount is required');
    }

    // Create payment session
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .insert({
        merchant_id: merchant.id,
        amount,
        currency,
        description,
        callback_url,
        success_redirect_url,
        failure_redirect_url,
        cancel_redirect_url,
        customer_email,
        customer_phone,
        payment_method,
        status: 'pending',
        checkout_url: `${Deno.env.get('SUPABASE_URL')}/checkout/${merchant.id}`,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      throw new Error('Failed to create payment session');
    }

    console.log('Payment session created:', session.id);

    return new Response(
      JSON.stringify({
        success: true,
        session_id: session.id,
        checkout_url: `https://payhubprime.com/checkout/${session.id}`,
        expires_at: session.expires_at,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error creating payment session:', error);
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
