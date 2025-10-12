import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Check, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Projects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projects, activeProject, setActiveProject, loadProjects } = useProject();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    business_name: "",
    business_email: "",
    business_phone: "",
  });

  const handleCreateProject = async () => {
    if (!formData.business_name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          business_name: formData.business_name,
          business_email: formData.business_email || null,
          business_phone: formData.business_phone || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      await loadProjects();
      setIsDialogOpen(false);
      setFormData({ business_name: "", business_email: "", business_phone: "" });

      // Set as active project
      if (data) {
        setActiveProject(data);
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });

      await loadProjects();

      // If deleted project was active, switch to first available project
      if (activeProject?.id === projectId) {
        const remainingProjects = projects.filter(p => p.id !== projectId);
        if (remainingProjects.length > 0) {
          setActiveProject(remainingProjects[0]);
        } else {
          setActiveProject(null);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteProjectId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground">Manage your payment integration projects</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className={activeProject?.id === project.id ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{project.business_name}</CardTitle>
                    {project.business_email && (
                      <CardDescription>{project.business_email}</CardDescription>
                    )}
                  </div>
                  {activeProject?.id === project.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {project.business_phone && (
                  <p className="text-sm text-muted-foreground">
                    {project.business_phone}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  {project.api_key ? `API Key: ${project.api_key.substring(0, 20)}...` : "No API key"}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                {activeProject?.id !== project.id && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setActiveProject(project);
                      navigate("/dashboard");
                    }}
                  >
                    Switch To
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate("/payment-settings")}
                  disabled={activeProject?.id !== project.id}
                >
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteProjectId(project.id)}
                  disabled={projects.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}

          {projects.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No projects yet</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Set up a new payment integration project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="business_name">Project Name *</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                placeholder="My E-commerce Store"
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
                value={formData.business_phone}
                onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
              All payment links, transactions, and configurations for this project will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProjectId && handleDeleteProject(deleteProjectId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Projects;
