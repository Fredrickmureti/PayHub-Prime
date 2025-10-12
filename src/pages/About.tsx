import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Users, Target, Heart, Award } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Users,
      title: "Accessibility First",
      description: "We believe payment integration should be accessible to everyone, not just developers.",
    },
    {
      icon: Target,
      title: "Simplicity",
      description: "Removing technical barriers so businesses can focus on growth, not code.",
    },
    {
      icon: Heart,
      title: "Trust & Security",
      description: "Your credentials and customer data are protected with bank-grade encryption.",
    },
    {
      icon: Award,
      title: "Transparency",
      description: "We're an integration layer, not a payment processor. Your money goes directly to you.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Eliminating Technical Barriers to Payment Integration
            </h1>
            <p className="text-xl text-muted-foreground">
              PayHub Prime was created to solve one problem: making online payment acceptance 
              accessible to everyone, not just those with technical expertise.
            </p>
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6 text-center">Our Mission</h2>
              <p className="text-xl text-muted-foreground text-center leading-relaxed">
                To eliminate the technical barriers that prevent businesses from accepting digital payments. 
                We believe every entrepreneur should be able to accept M-Pesa, PayPal, and card payments 
                without hiring developers or learning to code.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">What We Do</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  PayHub Prime is an <strong>integration layer</strong> that sits between your business 
                  and payment providers. We provide pre-built checkout pages and handle the technical complexity 
                  - you simply configure your payment provider credentials and share your payment link.
                </p>
                <p>
                  <strong>Important:</strong> We don't process or hold funds. Payments go directly from your 
                  customers to your M-Pesa, PayPal, or Stripe account. We simply make the integration easier 
                  by providing the infrastructure and user interface.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <div key={value.title} className="text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  PayHub Prime was created by <strong>Fredrick Mureti</strong> in 2025 to address a 
                  frustrating gap in the market: small businesses wanted to accept M-Pesa and international 
                  payments, but lacked the technical expertise to integrate payment APIs.
                </p>
                <p>
                  The solution? A no-code platform where anyone can set up payment acceptance in minutes. 
                  No frontend development. No backend servers. No complex integrations. Just a simple dashboard 
                  and shareable payment links.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
