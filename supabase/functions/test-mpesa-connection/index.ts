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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { merchantId } = await req.json();

    console.log('Testing M-Pesa connection for merchant:', merchantId);

    // Get merchant M-Pesa config
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: config, error: configError } = await supabaseAdmin
      .from('merchant_payment_configs')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('payment_method', 'mpesa')
      .single();

    if (configError || !config) {
      throw new Error('M-Pesa configuration not found. Please save your credentials first.');
    }

    // Validate required fields
    if (!config.mpesa_consumer_key || !config.mpesa_consumer_secret) {
      throw new Error('Consumer Key and Consumer Secret are required');
    }

    // Test OAuth token generation
    const authString = btoa(`${config.mpesa_consumer_key}:${config.mpesa_consumer_secret}`);
    const baseUrl = config.is_sandbox 
      ? 'https://sandbox.safaricom.co.ke' 
      : 'https://api.safaricom.co.ke';

    console.log('Testing OAuth with:', baseUrl);
    const authResponse = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
      },
    });

    const authData = await authResponse.json();
    console.log('OAuth response:', authData);

    if (!authResponse.ok || !authData.access_token) {
      throw new Error('Invalid credentials. Please check your Consumer Key and Consumer Secret.');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Connection successful! Your M-Pesa credentials are valid.',
        environment: config.is_sandbox ? 'Sandbox' : 'Production',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error testing M-Pesa connection:', error);
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
