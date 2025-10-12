import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import EnhancedFeatures from "@/components/landing/EnhancedFeatures";
import SecuritySection from "@/components/landing/SecuritySection";
import HowItWorks from "@/components/landing/HowItWorks";
import CTASection from "@/components/landing/CTASection";

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Everything Developers Need to Integrate Payments
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A developer-first API platform that simplifies payment integration
            </p>
          </div>
        </div>

        <EnhancedFeatures />
        <HowItWorks />
        <SecuritySection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Features;
