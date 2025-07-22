import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { deleteProjectThunk } from "@/redux/project/projectThunks";
import { useAppDispatch } from "@/store/store";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  onDelete: (projectId: string) => Promise<void>;
}

export default function DeleteProjectModal({
  isOpen,
  onClose,
  projectId,
  onDelete,
}: DeleteProjectModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isOpen) {
      document.body.style.pointerEvents = "auto";
    }
    return () => {
      document.body.style.pointerEvents = "auto";
    };
  }, [isOpen]);

  const handleDelete = async () => {
    if (!projectId) return;

    try {
      setIsDeleting(true);
      await onDelete(projectId);
      onClose();
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="bg-cyan-200/25 backdrop-blur-sm" />
      <DialogContent className="p-3 py-3 bg-[#fff] gap-0 rounded border border-[#EAF0FC] w-[500px] max-w-[90vw] z-50">
        <DialogHeader className="flex items-start">
          <DialogTitle className="text-[16px] font-semibold text-[#1C4980]">
            Remove project
          </DialogTitle>
        </DialogHeader>

        <div>
          <p className="text-[14px] text-[#1C4980] mb-4">
            This action will permanently delete the project and cannot be
            undone.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-[14px] font-medium text-[#1C4980] border border-[#EAF0FC] rounded"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-[14px] font-medium text-white bg-[#D63500] rounded disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete permanently"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
