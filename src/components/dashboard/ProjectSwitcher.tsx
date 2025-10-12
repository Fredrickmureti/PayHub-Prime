import { useProject } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ProjectSwitcher = () => {
  const { activeProject, projects, setActiveProject } = useProject();
  const navigate = useNavigate();

  if (!activeProject && projects.length === 0) {
    return (
      <Button
        variant="outline"
        onClick={() => navigate("/projects")}
        className="w-full justify-start"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Project
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="truncate">
            {activeProject?.business_name || "Select Project"}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel>Projects</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => setActiveProject(project)}
            className="flex items-center justify-between"
          >
            <span className="truncate">{project.business_name}</span>
            {activeProject?.id === project.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/projects")}>
          <Plus className="mr-2 h-4 w-4" />
          Manage Projects
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
