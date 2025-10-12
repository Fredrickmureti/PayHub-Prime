import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCards from "@/components/dashboard/StatsCards";
import TransactionsList from "@/components/dashboard/TransactionsList";
import { useToast } from "@/hooks/use-toast";
import { useProject } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeProject, projects } = useProject();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!activeProject && projects.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold mb-2">Welcome to PayHub</h1>
          <p className="text-muted-foreground mb-6">Create your first project to get started</p>
          <Button onClick={() => navigate("/projects")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your payment transactions</p>
        </div>

        <StatsCards userId={activeProject?.id} />
        <TransactionsList userId={activeProject?.id} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
