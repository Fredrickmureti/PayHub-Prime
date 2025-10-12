import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface MpesaPaymentFormProps {
  sessionId: string;
  amount: number;
  currency: string;
  onPaymentInitiated: () => void;
}

const MpesaPaymentForm = ({ sessionId, amount, currency, onPaymentInitiated }: MpesaPaymentFormProps) => {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("process-mpesa-payment", {
        body: {
          sessionId,
          phoneNumber: phone,
          amount,
        },
      });

      if (error) throw error;

      toast({
        title: "STK Push Sent",
        description: "Please check your phone and enter your M-Pesa PIN",
      });

      onPaymentInitiated();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to initiate payment",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">M-Pesa Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="254712345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <p className="text-sm text-muted-foreground">
          Enter your phone number in the format: 254XXXXXXXXX
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Pay {currency} {amount.toFixed(2)}
      </Button>
    </form>
  );
};

export default MpesaPaymentForm;
