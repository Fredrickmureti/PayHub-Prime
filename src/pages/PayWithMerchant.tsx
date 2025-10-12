import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import PaymentMethodFilter from "@/components/checkout/PaymentMethodFilter";
import MpesaPaymentForm from "@/components/checkout/MpesaPaymentForm";
import AirtelMoneyPaymentForm from "@/components/checkout/AirtelMoneyPaymentForm";
import CardPaymentForm from "@/components/checkout/CardPaymentForm";
import PayPalPaymentForm from "@/components/checkout/PayPalPaymentForm";
import PaymentStatusIndicator from "@/components/checkout/PaymentStatusIndicator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PayWithMerchant = () => {
  const { merchantId: projectId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  useEffect(() => {
    createSession();
  }, [projectId]);

  const createSession = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!projectId) {
        throw new Error('Project ID is required');
      }

      // Check if this is a payment link request
      const linkId = searchParams.get('link_id');
      let amount: string | null = searchParams.get('amount');
      let currency = searchParams.get('currency') || 'KES';
      let description = searchParams.get('desc') || searchParams.get('description');
      const reference = searchParams.get('ref') || searchParams.get('reference');
      let callbackUrl = searchParams.get('callback_url');
      let successUrl = searchParams.get('success_url');
      let failureUrl = searchParams.get('failure_url');
      let cancelUrl = searchParams.get('cancel_url');
      const customerEmail = searchParams.get('email');
      const customerPhone = searchParams.get('phone');

      // If link_id is provided, fetch payment link details
      if (linkId) {
        const { data: paymentLink, error: linkError } = await supabase
          .from('payment_links')
          .select('*')
          .eq('id', linkId)
          .eq('project_id', projectId)
          .single();

        if (linkError || !paymentLink) {
          throw new Error('Payment link not found');
        }

        if (!paymentLink.is_active) {
          throw new Error('This payment link is no longer active');
        }

        if (paymentLink.expires_at && new Date(paymentLink.expires_at) < new Date()) {
          throw new Error('This payment link has expired');
        }

        if (paymentLink.max_uses && paymentLink.current_uses >= paymentLink.max_uses) {
          throw new Error('This payment link has reached its maximum number of uses');
        }

        // Use payment link details
        amount = paymentLink.amount?.toString() || null;
        currency = paymentLink.currency;
        description = description || paymentLink.description || paymentLink.title;
        callbackUrl = callbackUrl || null;
        successUrl = successUrl || paymentLink.success_redirect_url || null;
        failureUrl = failureUrl || paymentLink.failure_redirect_url || null;
        cancelUrl = cancelUrl || paymentLink.cancel_redirect_url || null;
      }

      // Validate amount
      if (!amount || isNaN(parseFloat(amount))) {
        throw new Error('Valid amount parameter is required');
      }

      // Get project info
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('is_active', true)
        .single();

      if (projectError || !projectData) {
        throw new Error('Project not found or inactive');
      }

      setMerchant(projectData);

      // Create payment session
      const { data: session, error: sessionError } = await supabase
        .from('payment_sessions')
        .insert({
          project_id: projectId,
          amount: parseFloat(amount),
          currency,
          description: description || `Payment to ${projectData.business_name}`,
          callback_url: callbackUrl,
          success_redirect_url: successUrl,
          failure_redirect_url: failureUrl,
          cancel_redirect_url: cancelUrl,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          status: 'pending',
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        throw new Error('Failed to create payment session');
      }

      console.log('Payment session created:', session.id);
      setSessionId(session.id);
      setSession(session);

      // If this was a payment link, increment the usage counter
      if (linkId) {
        const { data: currentLink } = await supabase
          .from('payment_links')
          .select('current_uses')
          .eq('id', linkId)
          .single();

        if (currentLink) {
          await supabase
            .from('payment_links')
            .update({ current_uses: (currentLink.current_uses || 0) + 1 })
            .eq('id', linkId);
        }
      }

    } catch (err: any) {
      console.error('Error creating session:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Creating payment session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <div className="max-w-md w-full bg-card border rounded-lg p-6 text-center">
          <div className="text-destructive text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Payment Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="bg-card border rounded-lg p-6 mb-4">
          <h1 className="text-2xl font-bold mb-2">Pay {merchant?.business_name}</h1>
          <p className="text-muted-foreground text-sm">Secure payment powered by PayHub Prime</p>
        </div>

        {!selectedMethod ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Select Payment Method</h3>
                  <p className="text-sm text-muted-foreground mb-4">Choose your preferred payment option</p>
                </div>
                <PaymentMethodFilter sessionId={sessionId} onSelectMethod={setSelectedMethod} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedMethod === "mpesa" && "M-Pesa Payment"}
                      {selectedMethod === "airtel_money" && "Airtel Money Payment"}
                      {selectedMethod === "credit_card" && "Card Payment"}
                      {selectedMethod === "paypal" && "PayPal Payment"}
                    </h3>
                    <p className="text-sm text-muted-foreground">Enter your payment details</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedMethod(null)}>
                    Change Method
                  </Button>
                </div>

                {selectedMethod === "mpesa" && (
                  <MpesaPaymentForm
                    sessionId={sessionId}
                    amount={session.amount}
                    currency={session.currency}
                    onPaymentInitiated={() => {}}
                  />
                )}

                {selectedMethod === "airtel_money" && (
                  <AirtelMoneyPaymentForm
                    sessionId={sessionId}
                    amount={session.amount}
                    currency={session.currency}
                    onPaymentInitiated={() => {}}
                  />
                )}

                {selectedMethod === "credit_card" && (
                  <CardPaymentForm
                    sessionId={sessionId}
                    amount={session.amount}
                    currency={session.currency}
                    onPaymentInitiated={() => {}}
                  />
                )}

                {selectedMethod === "paypal" && (
                  <PayPalPaymentForm
                    sessionId={sessionId}
                    amount={session.amount}
                    currency={session.currency}
                    onPaymentInitiated={() => {}}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PayWithMerchant;
