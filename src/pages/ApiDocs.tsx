import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ApiDocs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      
      // Get project API key
      const { data: project } = await supabase
        .from("projects")
        .select("api_key")
        .eq("user_id", session.user.id)
        .single();
      
      if (project) {
        setApiKey(project.api_key);
      }
      
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const codeExamples = {
    createSession: `// Create a payment session
const response = await fetch('https://sjoroqyuvrsqvlurtdod.supabase.co/rest/v1/payment_sessions', {
  method: 'POST',
  headers: {
    'apikey': '${apiKey}',
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 100,
    currency: 'KES',
    description: 'Order #1234',
    callback_url: 'https://yourdomain.com/payment/callback'
  })
});

const session = await response.json();
const checkoutUrl = \`https://yourapp.com/checkout/\${session.id}\`;

// Redirect user to checkout
window.location.href = checkoutUrl;`,

    webhook: `// Handle payment webhook (Express.js example)
app.post('/payment/callback', async (req, res) => {
  const { session_id, status, transaction_id } = req.body;
  
  if (status === 'completed') {
    // Payment successful - fulfill order
    await fulfillOrder(session_id);
  } else if (status === 'failed') {
    // Payment failed - notify user
    await notifyFailure(session_id);
  }
  
  res.json({ received: true });
});`,

    checkStatus: `// Check payment status
const response = await fetch(\`https://sjoroqyuvrsqvlurtdod.supabase.co/rest/v1/payment_sessions?id=eq.\${sessionId}\`, {
  headers: {
    'apikey': '${apiKey}',
    'Authorization': 'Bearer ${apiKey}',
  }
});

const sessions = await response.json();
const status = sessions[0]?.status; // 'pending', 'processing', 'completed', 'failed'`,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">API Documentation</h1>
          <p className="text-muted-foreground">Integrate payment processing into your application</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your API Key</CardTitle>
            <CardDescription>Use this key to authenticate API requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 rounded-lg bg-muted text-sm font-mono break-all">
                {apiKey || "Loading..."}
              </code>
              <button
                onClick={() => copyToClipboard(apiKey)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep this key secure. Do not share it publicly or commit it to version control.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="create" className="space-y-4">
          <TabsList>
            <TabsTrigger value="create">Create Session</TabsTrigger>
            <TabsTrigger value="webhook">Webhooks</TabsTrigger>
            <TabsTrigger value="status">Check Status</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Payment Session</CardTitle>
                <CardDescription>
                  Initialize a new payment session and redirect your user to the checkout page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">POST</Badge>
                    <button
                      onClick={() => copyToClipboard(codeExamples.createSession)}
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </div>
                  <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                    <code className="text-sm">{codeExamples.createSession}</code>
                  </pre>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Request Body Parameters</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Field</th>
                        <th className="text-left py-2">Type</th>
                        <th className="text-left py-2">Required</th>
                        <th className="text-left py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="py-2"><code>amount</code></td>
                        <td>number</td>
                        <td>Yes</td>
                        <td>Payment amount</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2"><code>currency</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Currency code (e.g., KES)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2"><code>description</code></td>
                        <td>string</td>
                        <td>No</td>
                        <td>Payment description</td>
                      </tr>
                      <tr>
                        <td className="py-2"><code>callback_url</code></td>
                        <td>string</td>
                        <td>No</td>
                        <td>Webhook URL for payment updates</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhook" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Webhooks</CardTitle>
                <CardDescription>
                  Receive real-time notifications when payment status changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">POST</Badge>
                    <button
                      onClick={() => copyToClipboard(codeExamples.webhook)}
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </div>
                  <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                    <code className="text-sm">{codeExamples.webhook}</code>
                  </pre>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Webhook Payload</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Field</th>
                        <th className="text-left py-2">Type</th>
                        <th className="text-left py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="py-2"><code>session_id</code></td>
                        <td>string</td>
                        <td>Payment session ID</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2"><code>status</code></td>
                        <td>string</td>
                        <td>completed | failed | cancelled</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2"><code>transaction_id</code></td>
                        <td>string</td>
                        <td>Transaction reference</td>
                      </tr>
                      <tr>
                        <td className="py-2"><code>amount</code></td>
                        <td>number</td>
                        <td>Payment amount</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Check Payment Status</CardTitle>
                <CardDescription>
                  Query the current status of a payment session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">GET</Badge>
                    <button
                      onClick={() => copyToClipboard(codeExamples.checkStatus)}
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </div>
                  <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                    <code className="text-sm">{codeExamples.checkStatus}</code>
                  </pre>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Payment Status Values</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">pending</Badge>
                      <span className="text-sm text-muted-foreground">Payment session created, awaiting user action</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-warning/10 text-warning">processing</Badge>
                      <span className="text-sm text-muted-foreground">Payment initiated, waiting for confirmation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-success/10 text-success">completed</Badge>
                      <span className="text-sm text-muted-foreground">Payment successful</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-destructive/10 text-destructive">failed</Badge>
                      <span className="text-sm text-muted-foreground">Payment failed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-destructive/10 text-destructive">cancelled</Badge>
                      <span className="text-sm text-muted-foreground">User cancelled payment</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ApiDocs;
