import { CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import mpesaLogo from "@/assets/mpesa-logo.jpg";
import airtelLogo from "@/assets/airtel-logo.jpg";
import paypalLogo from "@/assets/paypal-logo.png";

interface PaymentMethodSelectorProps {
  onSelectMethod: (method: string) => void;
}

const PaymentMethodSelector = ({ onSelectMethod }: PaymentMethodSelectorProps) => {
  const methods = [
    {
      id: "mpesa",
      name: "M-Pesa",
      description: "Pay with your M-Pesa mobile money",
      logo: mpesaLogo,
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "airtel_money",
      name: "Airtel Money",
      description: "Pay with Airtel Money",
      logo: airtelLogo,
      color: "from-red-500 to-rose-600",
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Visa, Mastercard, Amex",
      icon: CreditCard,
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Pay with your PayPal account",
      logo: paypalLogo,
      color: "from-purple-500 to-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {methods.map((method) => {
        return (
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
                  ) : (
                    <method.icon className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{method.name}</h3>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Card>
        );
      })}
    </div>
  );
};

export default PaymentMethodSelector;
