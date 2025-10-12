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
    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    // Fetch session to get merchant_id
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('merchant_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Payment session not found');
    }

    // Fetch active payment configurations for this merchant
    const { data: configs, error: configError } = await supabase
      .from('merchant_payment_configs')
      .select('payment_method, is_active')
      .eq('merchant_id', session.merchant_id)
      .eq('is_active', true);

    if (configError) {
      throw new Error('Failed to load payment configurations');
    }

    const methods = Array.isArray(configs)
      ? configs.map((c) => c.payment_method).filter(Boolean)
      : [];

    return new Response(
      JSON.stringify({ success: true, methods }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('get-available-methods error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
