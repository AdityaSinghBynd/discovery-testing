import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { updateProject } from "@/redux/projectDocuments/projectDocumentsThunks";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
  } | null;
  onSuccess?: () => void;
  onUpdate: (name: string) => Promise<void>;
  isUpdating: boolean;
}

export default function EditProjectModal({
  isOpen,
  onClose,
  project,
  onUpdate,
  isUpdating,
}: EditProjectModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.pointerEvents = "auto";
    }
    return () => {
      document.body.style.pointerEvents = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (project) {
      setName(project.name);
    }
  }, [project]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleUpdate = async () => {
    if (!name.trim()) return;
    await onUpdate(name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-cyan-200/25 backdrop-blur-sm" />
      <DialogContent className="p-4 py-3 bg-white rounded gap-4 border border-[#EAF0FC] w-[600px] max-w-[90vw] z-50">
        <DialogHeader className="flex items-start justify-start">
          <DialogTitle className="text-[16px] font-semibold text-[#1C4980]">
            Edit Project Name
          </DialogTitle>
        </DialogHeader>

        <div>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-[14px] font-medium text-[#1C4980] mb-2"
            >
              Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 text-[16px] text-[#1C4980] border border-[#EAF0FC] rounded-lg focus:ring-1 focus:ring-[#0052FE] focus:border-[#0052FE] placeholder:text-[#8DA4BF]"
              placeholder="Enter project name"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[14px] font-medium text-[#1C4980] bg-white border border-[#EAF0FC] rounded transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating || !name.trim() || name === project?.name}
              className={`px-4 py-2 text-[14px] font-medium rounded transition-colors 
              ${isUpdating || !name.trim() || name === project?.name
                  ? "bg-[#E4E7EC] text-[#1C4980] cursor-not-allowed opacity-50"
                  : "bg-[#004CE6] text-white hover:bg-opacity-90 cursor-pointer"
                }`}
            >
              {isUpdating ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
