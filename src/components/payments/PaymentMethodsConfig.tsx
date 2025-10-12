import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import MpesaConfigForm from "./MpesaConfigForm";
import AirtelMoneyConfigForm from "./AirtelMoneyConfigForm";
import PayPalConfigForm from "./PayPalConfigForm";
import CreditCardConfigForm from "./CreditCardConfigForm";

interface PaymentMethodsConfigProps {
  projectId?: string | null;
}

const PaymentMethodsConfig = ({ projectId }: PaymentMethodsConfigProps) => {
  return (
    <Card className="p-6">
      <Tabs defaultValue="mpesa" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
          <TabsTrigger value="airtel">Airtel Money</TabsTrigger>
          <TabsTrigger value="paypal">PayPal</TabsTrigger>
          <TabsTrigger value="cards">Credit Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="mpesa" className="mt-6">
          <MpesaConfigForm projectId={projectId} />
        </TabsContent>

        <TabsContent value="airtel" className="mt-6">
          <AirtelMoneyConfigForm projectId={projectId} />
        </TabsContent>

        <TabsContent value="paypal" className="mt-6">
          <PayPalConfigForm projectId={projectId} />
        </TabsContent>

        <TabsContent value="cards" className="mt-6">
          <CreditCardConfigForm projectId={projectId} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default PaymentMethodsConfig;
