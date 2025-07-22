import React from "react";
import { Building2 } from "lucide-react";

const ProjectName: React.FC<any> = ({}) => {
  return (
    <div className="flex gap-2 items-center">
      <Building2 className="h-4 w-auto" />
      Project Name
    </div>
  );
};

export default ProjectName;
