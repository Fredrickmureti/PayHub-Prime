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

    // Extract API key
    const apiKey = authHeader.replace('Bearer ', '');

    // Get session ID from URL
    const url = new URL(req.url);
    const sessionId = url.pathname.split('/').pop();

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('*, merchants!inner(api_key)')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Payment session not found');
    }

    // Verify API key matches merchant
    if (session.merchants.api_key !== apiKey) {
      throw new Error('Unauthorized access to this session');
    }

    // Get transaction if exists
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        success: true,
        session_id: session.id,
        status: session.status,
        amount: session.amount,
        currency: session.currency,
        payment_method: session.payment_method,
        created_at: session.created_at,
        expires_at: session.expires_at,
        transaction: transaction ? {
          id: transaction.id,
          status: transaction.status,
          receipt_number: transaction.receipt_number,
          completed_at: transaction.transaction_timestamp,
        } : null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error getting payment status:', error);
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
