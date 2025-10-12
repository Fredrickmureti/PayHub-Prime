import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface CardPaymentFormProps {
  sessionId: string;
  amount: number;
  currency: string;
  onPaymentInitiated: () => void;
}

const StripeCardForm = ({ sessionId, amount, currency, onPaymentInitiated }: CardPaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('create-stripe-payment-intent', {
          body: { sessionId }
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error);

        setClientSecret(data.clientSecret);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to initialize payment",
        });
      }
    };

    createPaymentIntent();
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully",
        });
        onPaymentInitiated();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
      });
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: 'hsl(var(--foreground))',
        '::placeholder': {
          color: 'hsl(var(--muted-foreground))',
        },
      },
      invalid: {
        color: 'hsl(var(--destructive))',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Card Details</label>
        <div className="p-3 border rounded-md bg-background">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-muted-foreground">
          Your payment information is encrypted and secure
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading || !stripe || !clientSecret} size="lg">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? "Processing..." : `Pay ${currency} ${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};

const CardPaymentForm = (props: CardPaymentFormProps) => {
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    const initStripe = async () => {
      try {
        const { data } = await supabase.functions.invoke('create-stripe-payment-intent', {
          body: { sessionId: props.sessionId }
        });

        if (data?.publishableKey) {
          const stripe = await loadStripe(data.publishableKey);
          setStripePromise(stripe);
        }
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
      }
    };

    initStripe();
  }, [props.sessionId]);

  if (!stripePromise) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <StripeCardForm {...props} />
    </Elements>
  );
};

export default CardPaymentForm;
