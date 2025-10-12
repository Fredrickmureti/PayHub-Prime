import { UserPlus, Code, CreditCard, BarChart3, CheckCircle2 } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Sign Up & Configure",
      description: "Create your account and add your payment provider credentials (M-Pesa, Airtel Money, PayPal, Stripe) in the secure dashboard. No coding needed.",
      step: "01",
    },
    {
      icon: Code,
      title: "Get Your Payment Link",
      description: "Instantly generate a unique payment URL. Customize it with your branding, amounts, and descriptions - all from your dashboard.",
      step: "02",
    },
    {
      icon: CreditCard,
      title: "Share & Accept Payments",
      description: "Share your link via email, SMS, WhatsApp, or embed it on your website. Customers get a beautiful, mobile-friendly checkout experience.",
      step: "03",
    },
    {
      icon: BarChart3,
      title: "Track Everything",
      description: "Monitor all transactions in real-time from your dashboard. Export data, manage refunds, and get notified of successful payments.",
      step: "04",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start accepting payments in minutes - no technical skills required
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="bg-card rounded-xl p-6 border hover:shadow-lg transition-all h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-5xl font-bold text-primary/20">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-secondary"></div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/10 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Setup time: 5 minutes • No coding required</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
