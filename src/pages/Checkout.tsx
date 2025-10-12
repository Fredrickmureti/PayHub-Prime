import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Shield } from "lucide-react";
import { usePaymentSession } from "@/hooks/usePaymentSession";
import PaymentMethodFilter from "@/components/checkout/PaymentMethodFilter";
import MpesaPaymentForm from "@/components/checkout/MpesaPaymentForm";
import AirtelMoneyPaymentForm from "@/components/checkout/AirtelMoneyPaymentForm";
import CardPaymentForm from "@/components/checkout/CardPaymentForm";
import PayPalPaymentForm from "@/components/checkout/PayPalPaymentForm";
import PaymentStatusIndicator from "@/components/checkout/PaymentStatusIndicator";

const Checkout = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const { session, transaction, loading, error } = usePaymentSession(sessionId || "");

  useEffect(() => {
    if (session?.payment_method) {
      setSelectedMethod(session.payment_method);
    }
  }, [session?.payment_method]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Payment Session Not Found</CardTitle>
            <CardDescription>{error || "This payment session does not exist or has expired."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const showStatus = transaction?.status && ["processing", "awaiting_confirmation", "completed", "failed", "cancelled"].includes(transaction.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 hover:bg-muted"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Secure Payment Checkout</CardTitle>
                <CardDescription>Complete your payment with your preferred method</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Payment Summary */}
            <div className="bg-gradient-to-br from-muted/50 to-muted rounded-xl p-6 mb-6 border border-border">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="font-medium">{session.description || "Payment"}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold border-t border-border/50 pt-3">
                  <span>Total Amount:</span>
                  <span className="text-primary">
                    {session.currency} {session.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Show status if payment is in progress or completed */}
            {showStatus ? (
              <PaymentStatusIndicator
                status={transaction.status}
                paymentMethod={session.payment_method || undefined}
              />
            ) : (
              <>
                {/* Payment Method Selection */}
                {!selectedMethod ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Select Payment Method</h3>
                      <p className="text-sm text-muted-foreground mb-4">Choose your preferred payment option</p>
                    </div>
                    <PaymentMethodFilter sessionId={session.id} onSelectMethod={setSelectedMethod} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-border">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {selectedMethod === "mpesa" && "M-Pesa Payment"}
                          {selectedMethod === "airtel_money" && "Airtel Money Payment"}
                          {selectedMethod === "card" && "Card Payment"}
                          {selectedMethod === "paypal" && "PayPal Payment"}
                        </h3>
                        <p className="text-sm text-muted-foreground">Enter your payment details</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMethod(null)}
                      >
                        Change Method
                      </Button>
                    </div>

                    {selectedMethod === "mpesa" && (
                      <MpesaPaymentForm
                        sessionId={session.id}
                        amount={session.amount}
                        currency={session.currency}
                        onPaymentInitiated={() => {}}
                      />
                    )}

                    {selectedMethod === "airtel_money" && (
                      <AirtelMoneyPaymentForm
                        sessionId={session.id}
                        amount={session.amount}
                        currency={session.currency}
                        onPaymentInitiated={() => {}}
                      />
                    )}

                    {selectedMethod === "card" && (
                      <CardPaymentForm
                        sessionId={session.id}
                        amount={session.amount}
                        currency={session.currency}
                        onPaymentInitiated={() => {}}
                      />
                    )}

                    {selectedMethod === "paypal" && (
                      <PayPalPaymentForm
                        sessionId={session.id}
                        amount={session.amount}
                        currency={session.currency}
                        onPaymentInitiated={() => {}}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-lg p-4">
          <Shield className="h-4 w-4 text-success" />
          <span>Your payment is secured with end-to-end encryption</span>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
