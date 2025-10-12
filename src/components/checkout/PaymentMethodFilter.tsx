import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import mpesaLogo from "@/assets/mpesa-logo.jpg";
import airtelLogo from "@/assets/airtel-logo.jpg";
import paypalLogo from "@/assets/paypal-logo.png";

interface PaymentMethodFilterProps {
  sessionId: string;
  onSelectMethod: (method: string) => void;
}

const PaymentMethodFilter = ({ sessionId, onSelectMethod }: PaymentMethodFilterProps) => {
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const allMethods = [
    {
      id: "mpesa",
      name: "M-Pesa",
      description: "Pay with your M-Pesa mobile money",
      logo: mpesaLogo,
      color: "from-green-500 to-emerald-600",
      configKey: "mpesa",
    },
    {
      id: "airtel_money",
      name: "Airtel Money",
      description: "Pay with Airtel Money",
      logo: airtelLogo,
      color: "from-red-500 to-rose-600",
      configKey: "airtel_money",
    },
    {
      id: "credit_card",
      name: "Credit/Debit Card",
      description: "Visa, Mastercard, Amex",
      icon: CreditCard,
      color: "from-blue-500 to-indigo-600",
      configKey: "credit_card",
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Pay with your PayPal account",
      logo: paypalLogo,
      color: "from-purple-500 to-violet-600",
      configKey: "paypal",
    },
  ];

  useEffect(() => {
    loadAvailableMethods();
  }, [sessionId]);

  const loadAvailableMethods = async () => {
    try {
      // Use edge function to bypass RLS and fetch active methods for merchant
      const { data, error } = await supabase.functions.invoke('get-available-methods', {
        body: { sessionId }
      });

      if (error) throw error;

      if (data?.methods && Array.isArray(data.methods)) {
        setAvailableMethods(data.methods);
      } else {
        setAvailableMethods([]);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setAvailableMethods([]);
    } finally {
      setLoading(false);
    }
  };
  const filteredMethods = allMethods.filter(method =>
    availableMethods.includes(method.configKey)
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground mt-2">Loading payment methods...</p>
      </div>
    );
  }

  if (filteredMethods.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No payment methods are configured for this merchant.</p>
        <p className="text-sm text-muted-foreground mt-2">Please contact the merchant to set up payment options.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredMethods.map((method) => (
        <Card
          key={method.id}
          className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary"
          onClick={() => onSelectMethod(method.id)}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${method.color} shadow-lg flex items-center justify-center`}>
                {method.logo ? (
                  <img src={method.logo} alt={method.name} className="h-8 w-8 object-contain" />
                ) : method.icon ? (
                  <method.icon className="h-6 w-6 text-white" />
                ) : null}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{method.name}</h3>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>
      ))}
    </div>
  );
};

export default PaymentMethodFilter;
