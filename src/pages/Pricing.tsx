import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import FAQSection from "@/components/landing/FAQSection";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Pricing Plans</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your business. Scale as you grow.
            </p>
          </div>
        </div>

        <PricingSection />
        
        <div className="py-12">
          <FAQSection />
        </div>

        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
