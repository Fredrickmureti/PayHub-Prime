import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";

interface MerchantProfileFormProps {
  projectId: string | null;
}

const MerchantProfileForm = ({ projectId }: MerchantProfileFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    business_email: "",
    business_phone: "",
  });

  useEffect(() => {
    if (projectId) {
      loadProjectProfile();
    }
  }, [projectId]);

  const loadProjectProfile = async () => {
    if (!projectId) return;

    const { data, error } = await supabase
      .from('projects')
      .select('business_name, business_email, business_phone')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error loading project profile:', error);
      return;
    }

    if (data) {
      setFormData({
        business_name: data.business_name || "",
        business_email: data.business_email || "",
        business_phone: data.business_phone || "",
      });
    }
  };

  const handleSave = async () => {
    if (!projectId) return;

    if (!formData.business_name.trim()) {
      toast({
        title: "Error",
        description: "Business name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          business_name: formData.business_name.trim(),
          business_email: formData.business_email.trim() || null,
          business_phone: formData.business_phone.trim() || null,
        })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <CardTitle>Business Profile</CardTitle>
        </div>
        <CardDescription>
          This information will be displayed to customers when they make payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="business_name">Business Name *</Label>
          <Input
            id="business_name"
            value={formData.business_name}
            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            placeholder="Your Business Name"
          />
        </div>

        <div>
          <Label htmlFor="business_email">Business Email</Label>
          <Input
            id="business_email"
            type="email"
            value={formData.business_email}
            onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
            placeholder="business@example.com"
          />
        </div>

        <div>
          <Label htmlFor="business_phone">Business Phone</Label>
          <Input
            id="business_phone"
            type="tel"
            value={formData.business_phone}
            onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
            placeholder="+254700000000"
          />
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MerchantProfileForm;
