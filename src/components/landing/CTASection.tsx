import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Smartphone } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Accept Payments Without Coding?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join businesses accepting payments in minutes. No technical skills, no developers needed - just sign up and start.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-lg px-8"
            >
              <Link to="/auth">
                Start Accepting Payments
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8"
            >
              <Link to="/docs">View Documentation</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start gap-3">
              <Zap className="h-6 w-6 shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1">5-Minute Setup</div>
                <div className="text-sm text-white/80">No coding or technical knowledge needed</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1">Secure Platform</div>
                <div className="text-sm text-white/80">Bank-grade encryption for all credentials</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Smartphone className="h-6 w-6 shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1">Business Friendly</div>
                <div className="text-sm text-white/80">Built for entrepreneurs, not just developers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
