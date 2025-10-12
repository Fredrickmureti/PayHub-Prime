import { Link as LinkIcon, Shield, Bell, BarChart3, Zap, Smartphone, Palette, Headphones } from "lucide-react";

const EnhancedFeatures = () => {
  const features = [
    {
      icon: LinkIcon,
      title: "No-Code Payment Pages",
      description: "Pre-built checkout UI for M-Pesa, Airtel Money, PayPal, and Stripe. No frontend or backend development needed.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Shield,
      title: "Secure Credential Storage",
      description: "Store your payment provider credentials encrypted with AES-256. Never expose API keys in your code or website.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Bell,
      title: "Automated Notifications",
      description: "Get email alerts for successful payments. Optional webhooks available for advanced users who need real-time integration.",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: BarChart3,
      title: "Transaction Dashboard",
      description: "View all payments in one place. Export transaction data, track payment status, and manage refunds from your dashboard.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Zap,
      title: "5-Minute Setup",
      description: "Sign up, add your payment credentials, and get your payment link. No development time, no technical knowledge required.",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: Palette,
      title: "Payment Link Builder",
      description: "Create custom payment links with your branding, specific amounts, descriptions, and customer information.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Smartphone,
      title: "Mobile-Optimized Checkout",
      description: "Your customers get a beautiful, responsive payment experience that works perfectly on all devices and screen sizes.",
      color: "from-teal-500 to-teal-600",
    },
    {
      icon: Headphones,
      title: "Business-Friendly Support",
      description: "Email and chat support designed for business owners. Simple guides and tutorials - no technical jargon.",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to Accept Payments</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete payment solution built for businesses, not just developers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-card border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnhancedFeatures;
