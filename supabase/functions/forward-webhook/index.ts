import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

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

    const { transaction_id, merchant_id, webhook_url, event, data } = await req.json();

    if (!webhook_url) {
      return new Response(
        JSON.stringify({ success: false, error: 'No webhook URL provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get merchant API key for HMAC signature
    const { data: merchant } = await supabase
      .from('merchants')
      .select('api_key')
      .eq('id', merchant_id)
      .single();

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    // Generate HMAC signature
    const signature = merchant?.api_key 
      ? createHmac('sha256', merchant.api_key)
          .update(JSON.stringify(payload))
          .digest('hex')
      : '';

    // Retry logic: 3 attempts with exponential backoff
    const maxRetries = 3;
    let attempt = 0;
    let success = false;
    let lastError = null;
    let responseStatus = null;
    let responseBody = null;

    while (attempt < maxRetries && !success) {
      attempt++;
      
      try {
        console.log(`Webhook attempt ${attempt}/${maxRetries} to ${webhook_url}`);
        
        const webhookResponse = await fetch(webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event,
            'User-Agent': 'PaymentGateway-Webhook/1.0',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        responseStatus = webhookResponse.status;
        responseBody = await webhookResponse.text();

        if (webhookResponse.ok) {
          success = true;
          console.log(`Webhook delivered successfully on attempt ${attempt}`);
        } else {
          lastError = `HTTP ${responseStatus}: ${responseBody}`;
          console.error(`Webhook attempt ${attempt} failed:`, lastError);
        }
      } catch (error: any) {
        lastError = error.message;
        console.error(`Webhook attempt ${attempt} error:`, error);
      }

      // Exponential backoff: 1s, 2s, 4s
      if (!success && attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Log webhook attempt
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        transaction_id,
        merchant_id,
        webhook_url,
        request_payload: payload,
        response_status: responseStatus,
        response_body: responseBody,
        attempt_number: attempt,
        success,
        error_message: success ? null : lastError,
      });

    if (logError) {
      console.error('Error logging webhook attempt:', logError);
    }

    // Update transaction webhook status
    if (success) {
      await supabase
        .from('transactions')
        .update({
          webhook_delivered: true,
          webhook_attempts: attempt,
          webhook_last_attempt: new Date().toISOString(),
        })
        .eq('id', transaction_id);
    } else {
      await supabase
        .from('transactions')
        .update({
          webhook_delivered: false,
          webhook_attempts: attempt,
          webhook_last_attempt: new Date().toISOString(),
        })
        .eq('id', transaction_id);
    }

    return new Response(
      JSON.stringify({
        success,
        attempts: attempt,
        message: success 
          ? 'Webhook delivered successfully' 
          : `Webhook delivery failed after ${attempt} attempts: ${lastError}`,
      }),
      { 
        status: success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in webhook forwarder:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
