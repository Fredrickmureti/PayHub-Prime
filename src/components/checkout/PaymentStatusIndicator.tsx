import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentStatusIndicatorProps {
  status: string;
  paymentMethod?: string;
}

const PaymentStatusIndicator = ({ status, paymentMethod }: PaymentStatusIndicatorProps) => {
  const statusConfig: Record<string, {
    icon: any;
    title: string;
    description: string;
    variant: "default" | "destructive";
    animate?: boolean;
    success?: boolean;
  }> = {
    pending: {
      icon: Clock,
      title: "Payment Pending",
      description: "Waiting for payment to be initiated...",
      variant: "default",
    },
    processing: {
      icon: Loader2,
      title: "Processing Payment",
      description: paymentMethod === "mpesa" 
        ? "Please check your phone and enter your M-Pesa PIN" 
        : "Processing your payment...",
      variant: "default",
      animate: true,
    },
    awaiting_confirmation: {
      icon: Clock,
      title: "Awaiting Confirmation",
      description: "Your payment is being verified...",
      variant: "default",
    },
    completed: {
      icon: CheckCircle2,
      title: "Payment Successful!",
      description: "Your payment has been received and confirmed.",
      variant: "default",
      success: true,
    },
    failed: {
      icon: XCircle,
      title: "Payment Failed",
      description: "Your payment could not be processed. Please try again.",
      variant: "destructive",
    },
    cancelled: {
      icon: XCircle,
      title: "Payment Cancelled",
      description: "The payment was cancelled.",
      variant: "destructive",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Alert
      variant={config.variant}
      className={`${
        config.success ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <Icon
          className={`h-5 w-5 ${config.animate ? "animate-spin" : ""} ${
            config.success ? "text-green-600 dark:text-green-400" : ""
          }`}
        />
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{config.title}</h4>
          <AlertDescription>{config.description}</AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default PaymentStatusIndicator;
