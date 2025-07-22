export interface Document {
  id: number | string;
  url?: string;
  imageUrl?: string;
  alt: string;
  name: string;
  isActive: boolean;
}

export interface Project {
  id: string;
  name: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
  workspace: Record<string, any>;
  documents?: Document[];
}

export interface ProjectCardProps {
  project: Project;
  onProjectClick: (project: Project) => void;
  onDeleteProject: (projectId: string) => Promise<void>;
  onEditProject: (projectId: string, name: string) => Promise<void>;
  className?: string;
}
