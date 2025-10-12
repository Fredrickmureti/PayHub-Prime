import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, ExternalLink, Trash2, Link as LinkIcon, QrCode, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const PaymentLinks = () => {
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    currency: "KES",
    description: "",
    success_redirect_url: "",
    failure_redirect_url: "",
    cancel_redirect_url: "",
    max_uses: "",
    is_active: true,
  });

  useEffect(() => {
    loadProjectAndLinks();
  }, []);

  const loadProjectAndLinks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (projectData) {
        setProject(projectData);
        loadLinks(projectData.id);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLinks = async (projectId: string) => {
    const { data, error } = await supabase
      .from('payment_links')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading links:', error);
      return;
    }

    setLinks(data || []);
  };

  const createLink = async () => {
    try {
      if (!project) return;

      const linkData = {
        project_id: project.id,
        title: formData.title,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        currency: formData.currency,
        description: formData.description || null,
        success_redirect_url: formData.success_redirect_url || null,
        failure_redirect_url: formData.failure_redirect_url || null,
        cancel_redirect_url: formData.cancel_redirect_url || null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        is_active: formData.is_active,
      };

      let error;
      
      if (editingLink) {
        // Update existing link
        const result = await supabase
          .from('payment_links')
          .update(linkData)
          .eq('id', editingLink.id);
        error = result.error;
      } else {
        // Create new link
        const result = await supabase
          .from('payment_links')
          .insert(linkData);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: editingLink ? "Payment link updated successfully" : "Payment link created successfully",
      });

      setDialogOpen(false);
      setEditingLink(null);
      setFormData({
        title: "",
        amount: "",
        currency: "KES",
        description: "",
        success_redirect_url: "",
        failure_redirect_url: "",
        cancel_redirect_url: "",
        max_uses: "",
        is_active: true,
      });

      loadLinks(project.id);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (link: any) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      amount: link.amount ? link.amount.toString() : "",
      currency: link.currency,
      description: link.description || "",
      success_redirect_url: link.success_redirect_url || "",
      failure_redirect_url: link.failure_redirect_url || "",
      cancel_redirect_url: link.cancel_redirect_url || "",
      max_uses: link.max_uses ? link.max_uses.toString() : "",
      is_active: link.is_active,
    });
    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingLink(null);
      setFormData({
        title: "",
        amount: "",
        currency: "KES",
        description: "",
        success_redirect_url: "",
        failure_redirect_url: "",
        cancel_redirect_url: "",
        max_uses: "",
        is_active: true,
      });
    }
  };

  const copyLink = (linkId: string) => {
    const url = `${window.location.origin}/pay/${project.id}?link_id=${linkId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Payment link copied to clipboard",
    });
  };

  const deleteLink = async (linkId: string) => {
    const { error } = await supabase
      .from('payment_links')
      .delete()
      .eq('id', linkId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Deleted",
      description: "Payment link deleted",
    });

    loadLinks(project.id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payment Links</h1>
            <p className="text-muted-foreground">Create and manage reusable payment links</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingLink ? "Edit Payment Link" : "Create Payment Link"}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Link Title*</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Product Purchase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount (leave empty for variable)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="1000.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KES">KES</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Payment description"
                  />
                </div>

                <div>
                  <Label htmlFor="max_uses">Max Uses (optional)</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div>
                  <Label htmlFor="success_url">Success Redirect URL</Label>
                  <Input
                    id="success_url"
                    value={formData.success_redirect_url}
                    onChange={(e) => setFormData({ ...formData, success_redirect_url: e.target.value })}
                    placeholder="https://yourdomain.com/success"
                  />
                </div>

                <div>
                  <Label htmlFor="failure_url">Failure Redirect URL</Label>
                  <Input
                    id="failure_url"
                    value={formData.failure_redirect_url}
                    onChange={(e) => setFormData({ ...formData, failure_redirect_url: e.target.value })}
                    placeholder="https://yourdomain.com/failed"
                  />
                </div>

                <div>
                  <Label htmlFor="cancel_url">Cancel Redirect URL</Label>
                  <Input
                    id="cancel_url"
                    value={formData.cancel_redirect_url}
                    onChange={(e) => setFormData({ ...formData, cancel_redirect_url: e.target.value })}
                    placeholder="https://yourdomain.com/cancel"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <Button onClick={createLink} className="w-full">
                  {editingLink ? "Update Payment Link" : "Create Payment Link"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {links.map((link) => (
            <Card key={link.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{link.title}</CardTitle>
                    <CardDescription>
                      {link.amount ? `${link.currency} ${link.amount}` : 'Variable amount'} • 
                      {link.is_active ? ' Active' : ' Inactive'} • 
                      {link.current_uses} / {link.max_uses || '∞'} uses
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(link)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(link.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/pay/${project.id}?link_id=${link.id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {link.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </CardContent>
              )}
            </Card>
          ))}

          {links.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <LinkIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No payment links yet</h3>
                <p className="text-muted-foreground mb-4">Create your first payment link to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentLinks;
