import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ApiDocumentation = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('projects')
      .select('id, api_key')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProjectId(data.id);
      setApiKey(data.api_key || "");
    }
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const createSessionExample = `curl -X POST https://sjoroqyuvrsqvlurtdod.supabase.co/functions/v1/create-payment-session \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 1000,
    "currency": "KES",
    "description": "Order #123",
    "callback_url": "https://yourdomain.com/webhook",
    "success_redirect_url": "https://yourdomain.com/success",
    "failure_redirect_url": "https://yourdomain.com/failed",
    "customer_email": "customer@example.com"
  }'`;

  const getStatusExample = `curl -X GET https://sjoroqyuvrsqvlurtdod.supabase.co/functions/v1/get-payment-status/SESSION_ID \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}"`;

  const paymentLinkExample = `https://payhubprime.com/pay/${projectId || 'YOUR_PROJECT_ID'}?amount=1000&currency=KES&desc=Product+Purchase&ref=ORDER123`;

  const webhookVerificationNode = `const crypto = require('crypto');

function verifyWebhook(payload, signature, apiKey) {
  const expectedSignature = crypto
    .createHmac('sha256', apiKey)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// In your webhook handler
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;
  
  if (!verifyWebhook(payload, signature, '${apiKey || 'YOUR_API_KEY'}')) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  console.log('Payment event:', payload.event);
  console.log('Transaction data:', payload.data);
  
  res.json({ received: true });
});`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground">Complete guide to integrating PayHub Prime</p>
        </div>

        <Tabs defaultValue="quickstart" className="space-y-4">
          <TabsList>
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="api">REST API</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="links">Payment Links</TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>5-Minute Integration</CardTitle>
                <CardDescription>Get started without writing any backend code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Step 1: Configure Payment Methods</h3>
                  <p className="text-sm text-muted-foreground">Go to Payment Settings and add your payment provider credentials (M-Pesa, PayPal, etc.)</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Step 2: Generate Payment Link</h3>
                  <p className="text-sm text-muted-foreground mb-2">Use the Payment Link Builder or create a custom URL:</p>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm relative">
                    <code>{paymentLinkExample}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(paymentLinkExample)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Step 3: Share the Link</h3>
                  <p className="text-sm text-muted-foreground">Send the link via email, SMS, WhatsApp, or embed it in your website</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Step 4: Receive Webhooks (Optional)</h3>
                  <p className="text-sm text-muted-foreground">Set up a webhook endpoint to receive payment notifications automatically</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Payment Session</CardTitle>
                <CardDescription>POST /functions/v1/create-payment-session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm relative">
                  <pre className="whitespace-pre-wrap">{createSessionExample}</pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyCode(createSessionExample)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Get Payment Status</CardTitle>
                <CardDescription>GET /functions/v1/get-payment-status/:sessionId</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm relative">
                  <pre className="whitespace-pre-wrap">{getStatusExample}</pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyCode(getStatusExample)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Signature Verification</CardTitle>
                <CardDescription>Verify webhook authenticity using HMAC SHA-256</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm relative">
                  <pre className="whitespace-pre-wrap">{webhookVerificationNode}</pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyCode(webhookVerificationNode)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhook Events</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Code className="h-4 w-4 mt-1 text-primary" />
                    <div>
                      <strong>payment.completed</strong> - Payment was successful
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Code className="h-4 w-4 mt-1 text-primary" />
                    <div>
                      <strong>payment.failed</strong> - Payment failed
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="links" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Link Parameters</CardTitle>
                <CardDescription>URL query parameters for custom payment links</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-sm border-b pb-2 font-semibold">
                    <div>Parameter</div>
                    <div>Required</div>
                    <div>Description</div>
                  </div>
                  {[
                    { param: 'amount', required: 'Yes', desc: 'Payment amount in decimal format' },
                    { param: 'currency', required: 'No', desc: 'Currency code (default: KES)' },
                    { param: 'desc', required: 'No', desc: 'Payment description' },
                    { param: 'ref', required: 'No', desc: 'Your order/reference ID' },
                    { param: 'callback_url', required: 'No', desc: 'Webhook URL for notifications' },
                    { param: 'success_url', required: 'No', desc: 'Redirect after success' },
                    { param: 'failure_url', required: 'No', desc: 'Redirect after failure' },
                    { param: 'email', required: 'No', desc: 'Customer email' },
                    { param: 'phone', required: 'No', desc: 'Customer phone' },
                  ].map((item) => (
                    <div key={item.param} className="grid grid-cols-3 gap-4 text-sm py-2 border-b">
                      <code className="text-primary">{item.param}</code>
                      <span className={item.required === 'Yes' ? 'text-destructive' : 'text-muted-foreground'}>
                        {item.required}
                      </span>
                      <span className="text-muted-foreground">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ApiDocumentation;
