import { Shield, Lock, Eye, FileCheck } from "lucide-react";

const SecuritySection = () => {
  const features = [
    {
      icon: Shield,
      title: "Encrypted Credential Storage",
      description: "All merchant credentials are encrypted using AES-256 encryption at rest and in transit over HTTPS with TLS 1.3.",
    },
    {
      icon: Lock,
      title: "API Key Management",
      description: "Generate, rotate, and revoke API keys anytime from your dashboard. Role-based access control for team members.",
    },
    {
      icon: Eye,
      title: "No PII Storage",
      description: "We don't store customer payment details or personal information. Transactions are processed directly through payment providers.",
    },
    {
      icon: FileCheck,
      title: "Secure Communication",
      description: "All API calls over HTTPS with TLS 1.3. Webhook signatures verify payload authenticity and prevent tampering.",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Shield className="h-4 w-4" />
            Security First
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Security</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We implement industry-standard security measures to protect your credentials and data
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
          <div className="px-6 py-3 rounded-lg bg-card border font-semibold">HTTPS/TLS 1.3</div>
          <div className="px-6 py-3 rounded-lg bg-card border font-semibold">AES-256 Encryption</div>
          <div className="px-6 py-3 rounded-lg bg-card border font-semibold">API Key Authentication</div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
