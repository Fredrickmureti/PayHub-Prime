import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Code, Smartphone, ArrowRight } from "lucide-react";

const DocumentationPreview = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <LinkIcon className="h-4 w-4" />
              Simple Integration
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Three Ways to Integrate
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Choose the method that works best for you - no coding experience required for the first two options.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <LinkIcon className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">Payment Links (Easiest)</div>
                  <div className="text-sm text-muted-foreground">
                    Generate custom payment URLs instantly. Share via email, SMS, or social media.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Code className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">Embed Widget (Copy-Paste)</div>
                  <div className="text-sm text-muted-foreground">
                    Add checkout to your website with a simple HTML snippet. No backend needed.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Smartphone className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">API Integration (Advanced)</div>
                  <div className="text-sm text-muted-foreground">
                    Full REST API for developers who need custom workflows and automations.
                  </div>
                </div>
              </div>
            </div>

            <Button asChild size="lg">
              <Link to="/docs">
                View Integration Guide
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Right - Simple HTML Example */}
          <div className="relative">
            <div className="bg-card rounded-xl border p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 text-sm text-muted-foreground">embed-payment.html</span>
              </div>
              <pre className="text-sm overflow-x-auto">
                <code className="text-foreground">
{`<!-- Option 1: Payment Link -->
<a href="https://payhubprime.com/pay/YOUR_ID?amount=1000">
  Pay Now
</a>

<!-- Option 2: Embed Button -->
<script src="https://payhubprime.com/widget.js"
  data-merchant-id="YOUR_ID"
  data-amount="1000"
  data-currency="KES">
</script>

<!-- That's it! No backend code needed -->`}
                </code>
              </pre>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg font-semibold text-sm">
              Copy & paste ⚡
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DocumentationPreview;
