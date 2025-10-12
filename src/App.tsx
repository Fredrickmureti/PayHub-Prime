import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { ProjectProvider } from "@/contexts/ProjectContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PaymentSettings from "./pages/PaymentSettings";
import PaymentLinks from "./pages/PaymentLinks";
import Projects from "./pages/Projects";
import ApiDocumentation from "./pages/ApiDocumentation";
import TestPayment from "./pages/TestPayment";
import ApiDocs from "./pages/ApiDocs";
import PayWithMerchant from "./pages/PayWithMerchant";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Docs from "./pages/Docs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ProjectProvider>
          <ScrollToTop />
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/payment-settings" element={<PaymentSettings />} />
        <Route path="/payment-links" element={<PaymentLinks />} />
        <Route path="/api-documentation" element={<ApiDocumentation />} />
        <Route path="/test-payment" element={<TestPayment />} />
        <Route path="/pay/:merchantId" element={<PayWithMerchant />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/checkout/:sessionId" element={<Checkout />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/docs" element={<Docs />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </ProjectProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
