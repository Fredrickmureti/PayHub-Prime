import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import HeroSection from "@/components/landing/HeroSection";
import EnhancedFeatures from "@/components/landing/EnhancedFeatures";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingSection from "@/components/landing/PricingSection";
import SecuritySection from "@/components/landing/SecuritySection";
import DocumentationPreview from "@/components/landing/DocumentationPreview";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        <HeroSection />
        <EnhancedFeatures />
        <HowItWorks />
        <SecuritySection />
        <DocumentationPreview />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
