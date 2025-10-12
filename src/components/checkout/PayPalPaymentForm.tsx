import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalPaymentFormProps {
  sessionId: string;
  amount: number;
  currency: string;
  onPaymentInitiated: () => void;
}

const PayPalPaymentForm = ({ sessionId, amount, currency, onPaymentInitiated }: PayPalPaymentFormProps) => {
  const { toast } = useToast();
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSandbox, setIsSandbox] = useState(true);
  const [paypalCurrency, setPaypalCurrency] = useState<string>(currency);
  const [paypalAmount, setPaypalAmount] = useState<number>(amount);

  useEffect(() => {
    const fetchPayPalConfig = async () => {
      try {
        // Get session to find project_id
        const { data: session } = await supabase
          .from('payment_sessions')
          .select('project_id')
          .eq('id', sessionId)
          .single();

        if (!session) {
          throw new Error('Session not found');
        }

        // Get PayPal configuration
        const { data: config, error } = await supabase
          .from('merchant_payment_configs')
          .select('paypal_client_id, is_sandbox, is_active')
          .eq('project_id', session.project_id)
          .eq('payment_method', 'paypal')
          .single();

        if (error || !config || !config.is_active) {
          throw new Error('PayPal is not configured or not active');
        }

        // Check if currency needs conversion
        const supportedCurrencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CHF', 'HKD', 'SGD', 'SEK', 'DKK', 'NOK', 'NZD', 'THB', 'PHP', 'MYR', 'BRL', 'TWD', 'ILS', 'MXN', 'CZK', 'HUF', 'PLN'];
        if (!supportedCurrencies.includes(currency.toUpperCase())) {
          setPaypalCurrency('USD');
          // We'll get the converted amount when creating the order
        }

        setClientId(config.paypal_client_id);
        setIsSandbox(config.is_sandbox || false);
        setLoading(false);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: error.message || "Failed to load PayPal configuration",
        });
        setLoading(false);
      }
    };

    fetchPayPalConfig();
  }, [sessionId, toast, currency]);

  const createOrder = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: { sessionId }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Update currency and amount if they were converted
      if (data.currency && data.amount) {
        setPaypalAmount(data.amount);
        if (data.currency !== currency) {
          toast({
            title: "Currency Converted",
            description: `Payment will be processed in ${data.currency} ${data.amount.toFixed(2)}`,
          });
        }
      }

      onPaymentInitiated();
      return data.orderId;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create PayPal order",
      });
      throw error;
    }
  };

  const onApprove = async (data: any) => {
    try {
      const { data: captureData, error } = await supabase.functions.invoke('capture-paypal-payment', {
        body: { 
          orderId: data.orderID,
          sessionId 
        }
      });

      if (error) throw error;
      if (!captureData.success) throw new Error(captureData.error);

      toast({
        title: "Payment Successful!",
        description: `Your payment has been processed. Receipt: ${captureData.receiptNumber}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Failed to capture payment",
      });
    }
  };

  const onError = (error: any) => {
    console.error('PayPal Error:', error);
    toast({
      variant: "destructive",
      title: "PayPal Error",
      description: "An error occurred with PayPal. Please try again.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
        PayPal is not properly configured. Please contact the merchant.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4 border border-border">
        <p className="text-sm text-muted-foreground mb-2">
          You will be securely redirected to PayPal to complete your payment
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Click the PayPal button below</li>
          <li>Log in to your PayPal account</li>
          <li>Review and confirm your payment of {paypalCurrency} {paypalAmount.toFixed(2)}</li>
          <li>You'll be redirected back after completion</li>
        </ul>
      </div>

      <PayPalScriptProvider
        options={{
          clientId: clientId,
          currency: paypalCurrency,
          intent: "capture",
          vault: false,
          ...(isSandbox && { "data-sdk-integration-source": "integrationbuilder_sc" }),
        }}
      >
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 55,
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          onCancel={() => {
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the PayPal payment.",
            });
          }}
        />
      </PayPalScriptProvider>

      <p className="text-xs text-center text-muted-foreground">
        By continuing, you agree to PayPal's terms and conditions
      </p>
    </div>
  );
};

export default PayPalPaymentForm;
