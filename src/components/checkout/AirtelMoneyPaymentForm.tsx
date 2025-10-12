import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AirtelMoneyPaymentFormProps {
  sessionId: string;
  amount: number;
  currency: string;
  onPaymentInitiated: () => void;
}

const AirtelMoneyPaymentForm = ({ sessionId, amount, currency, onPaymentInitiated }: AirtelMoneyPaymentFormProps) => {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-airtel-payment', {
        body: {
          sessionId,
          phoneNumber: phone,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Payment Initiated",
          description: "Please check your phone and enter your Airtel Money PIN",
        });
        onPaymentInitiated();
      } else {
        throw new Error(data.error || 'Failed to initiate payment');
      }
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
        <Label htmlFor="phone">Airtel Money Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="254712345678 or 256700123456"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter your phone number with country code (Kenya: 254, Uganda: 256, Tanzania: 255)
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Pay {currency} {amount.toFixed(2)}
      </Button>
    </form>
  );
};

export default AirtelMoneyPaymentForm;
