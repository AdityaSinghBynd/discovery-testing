import type * as React from "react";
import { Check, File, Loader2, X } from "lucide-react";
import type { FileOperation, FileStatus } from "@/store/useTostStore";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FileToastProps {
  operation: FileOperation;
  onDismiss?: () => void;
}

const statusIcons: Record<FileStatus, React.ReactNode> = {
  uploading: <Loader2 className="h-4 w-4 animate-spin" />,
  downloading: <Loader2 className="h-4 w-4 animate-spin" />,
  processing: <Loader2 className="h-4 w-4 animate-spin" />,
  complete: <Check className="h-4 w-4" />,
  error: <X className="h-4 w-4" />,
};

export function FileToast({ operation, onDismiss }: FileToastProps) {
  const { fileName, status, progress, error } = operation;

  return (
    <div className="w-full min-w-[300px] rounded-md bg-background p-4 shadow-lg">
      <div className="flex items-start gap-4">
        <File className="mt-0.5 h-5 w-5 text-muted-foreground" />
        <div className="grid flex-1 gap-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{fileName}</div>
            <div
              className={cn(
                "ml-auto rounded-md px-1.5 py-0.5 text-xs font-medium",
                status === "complete" &&
                  "bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-400",
                status === "error" &&
                  "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-400",
                (status === "uploading" ||
                  status === "downloading" ||
                  status === "processing") &&
                  "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400",
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>
          {(status === "uploading" ||
            status === "downloading" ||
            status === "processing") && (
            <Progress value={progress} className="h-1" />
          )}
          {status === "error" && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          {status === "complete" && (
            <div className="text-sm text-muted-foreground">
              Completed successfully
            </div>
          )}
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="rounded-md p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
