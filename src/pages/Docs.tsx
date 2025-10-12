import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link as LinkIcon, Code, Webhook, Key, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Docs = () => {
  const { toast } = useToast();

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const paymentLinkExample = `https://payhubprime.com/pay/YOUR_MERCHANT_ID?amount=1000&currency=KES&desc=Product+Purchase&ref=ORDER123`;

  const embedExample = `<!-- Simple Button -->
<a href="https://payhubprime.com/pay/YOUR_MERCHANT_ID?amount=1000" 
   class="payment-button">
  Pay with M-Pesa, PayPal, or Card
</a>

<!-- Or use our widget (coming soon) -->
<script src="https://payhubprime.com/widget.js"
  data-merchant-id="YOUR_MERCHANT_ID"
  data-amount="1000"
  data-currency="KES">
</script>`;

  const apiExample = `// Advanced: Create payment session via API
const response = await fetch('https://sjoroqyuvrsqvlurtdod.supabase.co/functions/v1/create-payment-session', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 1000,
    currency: 'KES',
    description: 'Order #123',
    callback_url: 'https://yourdomain.com/webhook'
  })
});

const { session_id, checkout_url } = await response.json();
// Redirect user to checkout_url`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Documentation
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to start accepting payments - no coding required
            </p>
          </div>

          {/* Quick Start Notice */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2 text-lg">No Coding Required</h3>
                  <p className="text-muted-foreground">
                    The easiest way to integrate is using Payment Links. Just sign up, configure your payment 
                    providers in the dashboard, and you'll get a shareable link. The API is only needed for 
                    advanced custom integrations.
                  </p>
                  <Button asChild className="mt-4">
                    <Link to="/auth">Get Started Now</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="getting-started" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="payment-links">Payment Links</TabsTrigger>
              <TabsTrigger value="embed">Embed Widget</TabsTrigger>
              <TabsTrigger value="api">API (Advanced)</TabsTrigger>
            </TabsList>

            {/* Getting Started */}
            <TabsContent value="getting-started" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Start Guide</CardTitle>
                  <CardDescription>Get your payment system running in 5 minutes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                      Sign Up & Configure
                    </h3>
                    <p className="text-muted-foreground ml-8">
                      Create your free account at <Link to="/auth" className="text-primary hover:underline">payhubprime.com/auth</Link>. 
                      Go to Payment Settings and add your payment provider credentials (M-Pesa business number, PayPal client ID, Stripe keys, etc.).
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                      Get Your Payment Link
                    </h3>
                    <p className="text-muted-foreground ml-8">
                      Your merchant ID is displayed in your dashboard. Use it to create payment links with custom amounts, 
                      descriptions, and references. See the "Payment Links" tab for details.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
                      Share & Accept Payments
                    </h3>
                    <p className="text-muted-foreground ml-8">
                      Share your payment link via email, SMS, WhatsApp, or add it to your website. 
                      Customers click the link, choose their payment method (M-Pesa, PayPal, Card), and complete payment.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">4</span>
                      Track Transactions
                    </h3>
                    <p className="text-muted-foreground ml-8">
                      View all transactions in your dashboard. Get email notifications for successful payments. 
                      Export data or set up webhooks for automated processing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Links */}
            <TabsContent value="payment-links" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Payment Link Format
                  </CardTitle>
                  <CardDescription>Create custom payment URLs with query parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm relative">
                    <code className="break-all">{paymentLinkExample}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(paymentLinkExample)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Available Parameters</h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-4 text-sm border-b pb-2 font-semibold">
                        <div>Parameter</div>
                        <div>Required</div>
                        <div>Description</div>
                      </div>
                      {[
                        { param: 'amount', required: 'Yes', desc: 'Payment amount (e.g., 1000 for KES 1,000)' },
                        { param: 'currency', required: 'No', desc: 'Currency code (default: KES)' },
                        { param: 'desc', required: 'No', desc: 'Payment description or item name' },
                        { param: 'ref', required: 'No', desc: 'Your order/reference ID' },
                        { param: 'callback_url', required: 'No', desc: 'Webhook URL for notifications' },
                        { param: 'success_url', required: 'No', desc: 'Redirect URL after success' },
                        { param: 'failure_url', required: 'No', desc: 'Redirect URL after failure' },
                        { param: 'email', required: 'No', desc: 'Pre-fill customer email' },
                        { param: 'phone', required: 'No', desc: 'Pre-fill customer phone' },
                      ].map((item) => (
                        <div key={item.param} className="grid grid-cols-3 gap-4 text-sm py-2 border-b">
                          <code className="text-primary">{item.param}</code>
                          <span className={item.required === 'Yes' ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                            {item.required}
                          </span>
                          <span className="text-muted-foreground">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Embed Widget */}
            <TabsContent value="embed" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Embed on Your Website
                  </CardTitle>
                  <CardDescription>Add payment buttons to any webpage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm relative">
                    <pre className="whitespace-pre-wrap"><code>{embedExample}</code></pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(embedExample)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Note:</strong> Replace <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">YOUR_MERCHANT_ID</code> with 
                      your actual merchant ID from the dashboard.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Advanced */}
            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Integration (Advanced)
                  </CardTitle>
                  <CardDescription>For developers who need custom workflows</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-900 dark:text-yellow-100">
                      <strong>Most users don't need the API.</strong> Payment Links are easier and work for 99% of use cases. 
                      Only use the API if you need programmatic payment creation or custom workflows.
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg font-mono text-sm relative">
                    <pre className="whitespace-pre-wrap"><code>{apiExample}</code></pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(apiExample)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Getting Your API Key</h4>
                    <p className="text-muted-foreground text-sm">
                      Sign in to your dashboard and navigate to <Link to="/api-docs" className="text-primary hover:underline">API Documentation</Link> to 
                      view your API key. For full API reference, see the authenticated documentation section.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    Webhooks (Optional)
                  </CardTitle>
                  <CardDescription>Receive real-time payment notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    Webhooks allow your server to receive automatic notifications when payments are completed. 
                    You can set a callback_url in your payment link or API request.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    For webhook signature verification and payload format, see the authenticated 
                    <Link to="/api-documentation" className="text-primary hover:underline ml-1">API Documentation</Link>.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Help Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                If you're stuck or have questions:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Email us at support@payhubprime.com</li>
                <li>• Check the <Link to="/contact" className="text-primary hover:underline">Contact page</Link> for more support options</li>
                <li>• Review the <Link to="/pricing" className="text-primary hover:underline">Pricing page</Link> for plan details</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Docs;
