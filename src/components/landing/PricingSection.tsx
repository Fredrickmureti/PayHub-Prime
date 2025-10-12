import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PricingSection = () => {
  const features = [
    "Unlimited API calls",
    "All payment methods (M-Pesa, Airtel Money, PayPal, Stripe)",
    "Sandbox environment for testing",
    "Webhook management",
    "Transaction logs and monitoring",
    "Secure credential vault (AES-256 encryption)",
    "Developer dashboard",
    "API documentation & code examples",
    "Email support",
  ];

  return (
    <section className="py-20" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">100% Free Forever</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No subscription fees. No transaction fees. Just a powerful payment integration API.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl p-10 border-2 border-primary bg-primary/5">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
                <Check className="h-4 w-4" />
                Always Free
              </div>
              <h3 className="text-3xl font-bold mb-2">Developer Plan</h3>
              <div className="mb-4">
                <span className="text-6xl font-bold">$0</span>
                <span className="text-muted-foreground text-xl">/forever</span>
              </div>
              <p className="text-muted-foreground mb-8">
                Everything you need to integrate payments into your application
              </p>

              <Button asChild size="lg" className="w-full max-w-sm">
                <Link to="/auth">Get Started Free</Link>
              </Button>
            </div>

            <div className="pt-8 border-t">
              <h4 className="font-semibold mb-4 text-center">What's Included:</h4>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 space-y-2">
          <p className="text-sm text-muted-foreground">
            No hidden fees. No credit card required. No strings attached.
          </p>
          <p className="text-xs text-muted-foreground">
            You'll need your own merchant accounts with M-Pesa, Airtel Money, PayPal, or Stripe. Their standard fees apply directly to you.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
