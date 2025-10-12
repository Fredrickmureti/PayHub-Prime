import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface MpesaConfigFormProps {
  projectId?: string | null;
}

const MpesaConfigForm = ({ projectId }: MpesaConfigFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState({
    consumer_key: "",
    consumer_secret: "",
    shortcode: "",
    passkey: "",
    callback_url: "",
    account_reference_template: "{transaction_id}",
    transaction_desc_template: "{description}",
    is_sandbox: true,
    is_active: false,
  });

  useEffect(() => {
    if (!projectId) return;

    const fetchConfig = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("merchant_payment_configs")
        .select("*")
        .eq("project_id", projectId)
        .eq("payment_method", "mpesa")
        .maybeSingle();

      if (data) {
        setConfig({
          consumer_key: data.mpesa_consumer_key || "",
          consumer_secret: data.mpesa_consumer_secret || "",
          shortcode: data.mpesa_shortcode || "",
          passkey: data.mpesa_passkey || "",
          callback_url: data.mpesa_callback_url || "",
          account_reference_template: data.mpesa_account_reference_template || "{transaction_id}",
          transaction_desc_template: data.mpesa_transaction_desc_template || "{description}",
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
        payment_method: "mpesa",
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
          payment_method: "mpesa",
          mpesa_consumer_key: config.consumer_key,
          mpesa_consumer_secret: config.consumer_secret,
          mpesa_shortcode: config.shortcode,
          mpesa_passkey: config.passkey,
          mpesa_callback_url: config.callback_url,
          mpesa_account_reference_template: config.account_reference_template,
          mpesa_transaction_desc_template: config.transaction_desc_template,
          is_sandbox: config.is_sandbox,
          is_active: config.is_active,
        }, {
          onConflict: "project_id,payment_method"
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "M-Pesa configuration saved successfully",
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

  const handleTestConnection = async () => {
    if (!projectId) return;

    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-mpesa-connection', {
        body: { projectId: projectId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Connection Successful",
          description: data.message,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message,
      });
    } finally {
      setTesting(false);
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
            <Label htmlFor="is_active" className="text-base font-medium">
              Enable M-Pesa
            </Label>
            <p className="text-sm text-muted-foreground">
              Activate M-Pesa payments for your business
            </p>
          </div>
          <Switch
            id="is_active"
            checked={config.is_active}
            onCheckedChange={async (checked) => {
              setConfig({ ...config, is_active: checked });
              try { await savePartial({ is_active: checked }); } catch {}
            }}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <Label htmlFor="is_sandbox" className="text-base font-medium">
              Sandbox Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Use test environment for development
            </p>
          </div>
          <Switch
            id="is_sandbox"
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
          <Label htmlFor="consumer_key">Consumer Key</Label>
          <Input
            id="consumer_key"
            value={config.consumer_key}
            onChange={(e) =>
              setConfig({ ...config, consumer_key: e.target.value })
            }
            placeholder="Enter your Daraja API consumer key"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="consumer_secret">Consumer Secret</Label>
          <Input
            id="consumer_secret"
            type="password"
            value={config.consumer_secret}
            onChange={(e) =>
              setConfig({ ...config, consumer_secret: e.target.value })
            }
            placeholder="Enter your Daraja API consumer secret"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortcode">Business Short Code</Label>
          <Input
            id="shortcode"
            value={config.shortcode}
            onChange={(e) =>
              setConfig({ ...config, shortcode: e.target.value })
            }
            placeholder="e.g., 174379"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passkey">Pass Key</Label>
          <Input
            id="passkey"
            type="password"
            value={config.passkey}
            onChange={(e) =>
              setConfig({ ...config, passkey: e.target.value })
            }
            placeholder="Enter your Lipa Na M-Pesa passkey"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="callback_url">Callback URL</Label>
          <Input
            id="callback_url"
            value={config.callback_url}
            onChange={(e) =>
              setConfig({ ...config, callback_url: e.target.value })
            }
            placeholder="https://yourdomain.com/mpesa/callback"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account_reference_template">
            Account Reference Template
            <span className="text-xs text-muted-foreground ml-2">(Max 12 chars)</span>
          </Label>
          <Input
            id="account_reference_template"
            value={config.account_reference_template}
            onChange={(e) =>
              setConfig({ ...config, account_reference_template: e.target.value })
            }
            placeholder="{transaction_id}"
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground">
            Available variables: {"{transaction_id}"}, {"{session_id}"}, {"{merchant_id}"}, {"{amount}"}, {"{phone}"}, {"{description}"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transaction_desc_template">
            Transaction Description Template
            <span className="text-xs text-muted-foreground ml-2">(Max 13 chars)</span>
          </Label>
          <Input
            id="transaction_desc_template"
            value={config.transaction_desc_template}
            onChange={(e) =>
              setConfig({ ...config, transaction_desc_template: e.target.value })
            }
            placeholder="{description}"
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground">
            Available variables: {"{transaction_id}"}, {"{session_id}"}, {"{merchant_id}"}, {"{amount}"}, {"{phone}"}, {"{description}"}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1" 
          onClick={handleTestConnection}
          disabled={testing || !config.consumer_key || !config.consumer_secret}
        >
          {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Test Connection
        </Button>
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Configuration
        </Button>
      </div>
    </form>
  );
};

export default MpesaConfigForm;
