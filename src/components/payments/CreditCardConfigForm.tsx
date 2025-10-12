import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreditCardConfigFormProps {
  projectId?: string | null;
}

const CreditCardConfigForm = ({ projectId }: CreditCardConfigFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    processor: "stripe",
    api_key: "",
    secret_key: "",
    is_sandbox: true,
    is_active: false,
  });

  useEffect(() => {
    if (!projectId) return;

    const fetchConfig = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("merchant_payment_configs")
        .select("*")
        .eq("project_id", projectId)
        .eq("payment_method", "credit_card")
        .maybeSingle();

      if (data) {
        setConfig({
          processor: data.card_processor || "stripe",
          api_key: data.card_api_key || "",
          secret_key: data.card_secret_key || "",
          is_sandbox: data.is_sandbox ?? true,
          is_active: data.is_active ?? false,
        });
      }
      setLoading(false);
    };

    fetchConfig();
  }, [projectId]);

  const savePartial = async (partial: any) => {
    if (!projectId) return;
    const { error } = await supabase
      .from("merchant_payment_configs")
      .upsert({
        project_id: projectId,
        payment_method: "credit_card",
        ...partial,
      }, {
        onConflict: "project_id,payment_method"
      });
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      throw error;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("merchant_payment_configs")
        .upsert({
          project_id: projectId,
          payment_method: "credit_card",
          card_processor: config.processor,
          card_api_key: config.api_key,
          card_secret_key: config.secret_key,
          is_sandbox: config.is_sandbox,
          is_active: config.is_active,
        }, {
          onConflict: "project_id,payment_method"
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Credit card configuration saved successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <Label htmlFor="card_active" className="text-base font-medium">
              Enable Credit Cards
            </Label>
            <p className="text-sm text-muted-foreground">
              Activate credit card payments for your business
            </p>
          </div>
          <Switch
            id="card_active"
            checked={config.is_active}
            onCheckedChange={async (checked) => {
              setConfig({ ...config, is_active: checked });
              try { await savePartial({ is_active: checked }); } catch {}
            }}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <Label htmlFor="card_sandbox" className="text-base font-medium">
              Test Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Use test environment for development
            </p>
          </div>
          <Switch
            id="card_sandbox"
            checked={config.is_sandbox}
            onCheckedChange={async (checked) => {
              setConfig({ ...config, is_sandbox: checked });
              try { await savePartial({ is_sandbox: checked }); } catch {}
            }}
          />
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="processor">Payment Processor</Label>
          <Select
            value={config.processor}
            onValueChange={(value) =>
              setConfig({ ...config, processor: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="flutterwave">Flutterwave</SelectItem>
              <SelectItem value="paystack">Paystack</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="api_key">Publishable/Public Key</Label>
          <Input
            id="api_key"
            value={config.api_key}
            onChange={(e) =>
              setConfig({ ...config, api_key: e.target.value })
            }
            placeholder="Enter your publishable key"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secret_key">Secret Key</Label>
          <Input
            id="secret_key"
            type="password"
            value={config.secret_key}
            onChange={(e) =>
              setConfig({ ...config, secret_key: e.target.value })
            }
            placeholder="Enter your secret key"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Save Configuration
      </Button>
    </form>
  );
};

export default CreditCardConfigForm;
