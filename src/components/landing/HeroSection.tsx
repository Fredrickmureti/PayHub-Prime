import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle2 } from "lucide-react";
import mpesaLogo from "@/assets/mpesa-logo.jpg";
import airtelLogo from "@/assets/airtel-logo.jpg";
import paypalLogo from "@/assets/paypal-logo.png";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>

      <div className="container relative mx-auto px-4 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              No-Code Payment Integration
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Accept Payments
              <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Without Coding
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl">
              Pre-built checkout UI for M-Pesa, Airtel Money, PayPal, and Stripe. 
              No frontend or backend code needed. Just sign up, configure, and share your payment link.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/auth">Start Accepting Payments</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 gap-2">
                <Link to="/docs">
                  <Play className="h-5 w-5" />
                  How It Works
                </Link>
              </Button>
            </div>

            {/* Payment logos */}
            <div className="pt-8">
              <p className="text-sm text-muted-foreground mb-4">Supports Integration With</p>
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start items-center">
                <img src={mpesaLogo} alt="M-Pesa" className="h-8 object-contain grayscale hover:grayscale-0 transition-all" />
                <img src={airtelLogo} alt="Airtel Money" className="h-8 object-contain grayscale hover:grayscale-0 transition-all" />
                <img src={paypalLogo} alt="PayPal" className="h-8 object-contain grayscale hover:grayscale-0 transition-all" />
                <div className="px-4 py-2 rounded bg-muted text-sm font-semibold">Visa</div>
                <div className="px-4 py-2 rounded bg-muted text-sm font-semibold">Mastercard</div>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border bg-card">
              <div className="bg-gradient-to-br from-background to-muted p-6">
                <div className="flex items-center gap-2 mb-6 pb-3 border-b">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Payment Link Ready</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-background p-4 rounded-lg border">
                    <div className="text-xs text-muted-foreground mb-2">Your Payment Link</div>
                    <div className="font-mono text-sm text-primary break-all">
                      payhubprime.com/pay/your-id
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background p-3 rounded-lg border">
                      <div className="text-xs text-muted-foreground mb-1">Amount</div>
                      <div className="font-semibold">KES 5,000</div>
                    </div>
                    <div className="bg-background p-3 rounded-lg border">
                      <div className="text-xs text-muted-foreground mb-1">Methods</div>
                      <div className="font-semibold">4 Active</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 py-2 px-3 rounded bg-primary/10 text-primary text-xs font-medium text-center">
                      ✓ M-Pesa
                    </div>
                    <div className="flex-1 py-2 px-3 rounded bg-primary/10 text-primary text-xs font-medium text-center">
                      ✓ PayPal
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg font-semibold text-sm">
              5 min setup ⚡
            </div>
            
            {/* Floating elements */}
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
