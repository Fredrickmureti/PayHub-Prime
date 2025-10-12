import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AirtelMoneyConfigFormProps {
  projectId?: string | null;
}

const AirtelMoneyConfigForm = ({ projectId }: AirtelMoneyConfigFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    client_id: "",
    client_secret: "",
    merchant_code: "",
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
        .eq("payment_method", "airtel_money")
        .maybeSingle();

      if (data) {
        setConfig({
          client_id: data.airtel_client_id || "",
          client_secret: data.airtel_client_secret || "",
          merchant_code: data.airtel_merchant_code || "",
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
        payment_method: "airtel_money",
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
          payment_method: "airtel_money",
          airtel_client_id: config.client_id,
          airtel_client_secret: config.client_secret,
          airtel_merchant_code: config.merchant_code,
          is_sandbox: config.is_sandbox,
          is_active: config.is_active,
        }, {
          onConflict: "project_id,payment_method"
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Airtel Money configuration saved successfully",
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
            <Label htmlFor="airtel_active" className="text-base font-medium">
              Enable Airtel Money
            </Label>
            <p className="text-sm text-muted-foreground">
              Activate Airtel Money payments for your business
            </p>
          </div>
          <Switch
            id="airtel_active"
            checked={config.is_active}
            onCheckedChange={async (checked) => {
              setConfig({ ...config, is_active: checked });
              try { await savePartial({ is_active: checked }); } catch {}
            }}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <Label htmlFor="airtel_sandbox" className="text-base font-medium">
              Sandbox Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Use test environment for development
            </p>
          </div>
          <Switch
            id="airtel_sandbox"
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
          <Label htmlFor="client_id">Client ID</Label>
          <Input
            id="client_id"
            value={config.client_id}
            onChange={(e) =>
              setConfig({ ...config, client_id: e.target.value })
            }
            placeholder="Enter your Airtel Money client ID"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_secret">Client Secret</Label>
          <Input
            id="client_secret"
            type="password"
            value={config.client_secret}
            onChange={(e) =>
              setConfig({ ...config, client_secret: e.target.value })
            }
            placeholder="Enter your Airtel Money client secret"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="merchant_code">Merchant Code</Label>
          <Input
            id="merchant_code"
            value={config.merchant_code}
            onChange={(e) =>
              setConfig({ ...config, merchant_code: e.target.value })
            }
            placeholder="Enter your merchant code"
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

export default AirtelMoneyConfigForm;
