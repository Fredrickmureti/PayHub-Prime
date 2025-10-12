import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Settings, 
  CreditCard, 
  LogOut, 
  Menu, 
  X,
  Play,
  Book,
  Link as LinkIcon,
  FolderKanban
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { useProject } from "@/contexts/ProjectContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeProject } = useProject();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/auth");
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Payment Settings", href: "/payment-settings", icon: Settings },
    { name: "Payment Links", href: "/payment-links", icon: LinkIcon },
    { name: "API Documentation", href: "/api-documentation", icon: Book },
    { name: "Test Payment", href: "/test-payment", icon: Play },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Project Switcher */}
          <div className="p-6 border-b border-border space-y-4">
            <div className="flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-foreground">PayHub</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-2">
              <ProjectSwitcher />
              {activeProject && (
                <p className="text-xs text-muted-foreground px-2 truncate">
                  Active: {activeProject.business_name}
                </p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border lg:hidden">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Link to="/dashboard" className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">PayHub</span>
            </Link>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
