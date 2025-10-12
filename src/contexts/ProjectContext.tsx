import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  business_name: string;
  business_email: string | null;
  business_phone: string | null;
  api_key: string | null;
}

interface ProjectContextType {
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  projects: Project[];
  loadProjects: () => Promise<void>;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProjects(data || []);

      // Set active project from localStorage or use first project
      const savedProjectId = localStorage.getItem("activeProjectId");
      if (savedProjectId && data) {
        const savedProject = data.find((p) => p.id === savedProjectId);
        if (savedProject) {
          setActiveProjectState(savedProject);
        } else if (data.length > 0) {
          setActiveProjectState(data[0]);
          localStorage.setItem("activeProjectId", data[0].id);
        }
      } else if (data && data.length > 0) {
        setActiveProjectState(data[0]);
        localStorage.setItem("activeProjectId", data[0].id);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveProject = (project: Project | null) => {
    setActiveProjectState(project);
    if (project) {
      localStorage.setItem("activeProjectId", project.id);
    } else {
      localStorage.removeItem("activeProjectId");
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <ProjectContext.Provider
      value={{ activeProject, setActiveProject, projects, loadProjects, isLoading }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
