import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "Do you process payments?",
      answer: "No. We provide the API infrastructure to simplify payment integration. Payments are processed through your own merchant accounts with M-Pesa, Airtel Money, PayPal, or Stripe. We help you integrate with these providers faster and more securely.",
    },
    {
      question: "Do I need my own merchant accounts?",
      answer: "Yes. You need to register for merchant accounts with the payment providers you want to support (M-Pesa Business, Airtel Money Merchant, PayPal Business, Stripe). We securely store your credentials and provide a unified API to interact with all of them.",
    },
    {
      question: "How long does integration take?",
      answer: "Most developers complete the integration in 15-30 minutes. Our comprehensive REST API documentation and code examples make it straightforward to get started.",
    },
    {
      question: "What are your fees?",
      answer: "We charge API usage fees based on your plan (see Pricing). We do NOT charge transaction processing fees. The payment providers (M-Pesa, Airtel Money, PayPal, Stripe) charge their standard transaction fees directly to your merchant account.",
    },
    {
      question: "Which payment methods do you support?",
      answer: "Our API supports integration with M-Pesa, Airtel Money, PayPal, and Stripe. This allows your customers to pay via mobile money, credit cards, and digital wallets. New payment methods are added regularly.",
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We encrypt all merchant credentials with AES-256 encryption. We don't store customer payment information - transactions are processed directly through the payment providers' systems. All API calls use HTTPS with TLS 1.3.",
    },
    {
      question: "Who handles settlements?",
      answer: "Payment providers (M-Pesa, Airtel Money, PayPal, Stripe) settle funds directly to your bank account based on their standard terms. We don't hold or process funds.",
    },
    {
      question: "Can I test the platform before going live?",
      answer: "Absolutely! We provide a full sandbox environment where you can test all payment methods without processing real transactions. Start with our free Developer plan.",
    },
    {
      question: "How do webhooks work?",
      answer: "We aggregate webhooks from all payment providers into a unified format. Configure one webhook URL in your dashboard to receive standardized payment status updates from M-Pesa, Airtel Money, PayPal, and Stripe.",
    },
    {
      question: "Do you offer technical support?",
      answer: "Yes! All plans include email support. Startup plans get priority support, and Business plans receive dedicated support channels.",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-lg px-6 bg-card"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
