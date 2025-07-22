import { create } from "zustand";

export type FileStatus =
  | "uploading"
  | "downloading"
  | "processing"
  | "complete"
  | "error";

export interface FileOperation {
  id: string;
  fileName: string;
  status: FileStatus;
  progress: number;
  error?: string;
  type: "upload" | "download" | "process";
  timestamp: number;
}

interface ToastStore {
  operations: FileOperation[];
  isMinimized: boolean;
  addOperation: (operation: Omit<FileOperation, "timestamp">) => string;
  updateOperation: (id: string, updates: Partial<FileOperation>) => void;
  removeOperation: (id: string) => void;
  toggleMinimize: () => void;
  clearCompleted: () => void;
  reset: () => void;
}

export const useToastStore = create<ToastStore>((set: any) => ({
  operations: [],
  isMinimized: false,
  addOperation: (operation: any) => {
    set((state: any) => ({
      operations: [
        ...state.operations,
        { ...operation, timestamp: Date.now() },
      ],
      isMinimized: false,
    }));
    return operation;
  },
  updateOperation: (id: any, updates: any) =>
    set((state: any) => ({
      operations: state.operations.map((op: any) =>
        op.id === id ? { ...op, ...updates } : op,
      ),
    })),
  removeOperation: (id: any) =>
    set((state: any) => ({
      operations: state.operations.filter((op: any) => op.id !== id),
    })),
  toggleMinimize: () =>
    set((state: any) => ({
      isMinimized: !state.isMinimized,
    })),
  clearCompleted: () =>
    set((state: any) => ({
      operations: state.operations.filter(
        (op: any) => op.status !== "complete" && op.status !== "error",
      ),
    })),
  reset: () => set(({ operations: [] })),
}));
