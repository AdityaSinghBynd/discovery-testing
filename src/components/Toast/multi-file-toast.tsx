"use client";
import { ChevronDown, ChevronUp, File, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { type FileOperation, useToastStore } from "@/store/useTostStore";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MultiFileToast() {
  const { operations, isMinimized, toggleMinimize, clearCompleted } =
    useToastStore();

  if (operations.length === 0) return null;

  const totalOperations = operations.length;
  const completedOperations = operations.filter(
    (op: any) => op.status === "complete" || op.status === "error",
  ).length;
  const inProgressOperations = operations.filter(
    (op: any) => op.status !== "complete" && op.status !== "error",
  );
  const hasInProgress = inProgressOperations.length > 0;

  return (
    <div className="w-[450px] rounded bg-background shadow-lg">
      <div className="flex items-center justify-between border-b">
        <div className="flex items-center space-between">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <File className="h-4 w-4 text-primary" />
          </div>
          <div className="flex">
            <h3 className="font-semibold pr-2">
              {hasInProgress ? "Processing files..." : "Uploads complete"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {completedOperations} of {totalOperations} complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleMinimize}
          >
            {isMinimized ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          {!hasInProgress && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={clearCompleted}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {!isMinimized && (
        <div className="max-h-[300px] overflow-y-auto p-2">
          <AnimatePresence initial={false}>
            {operations.map((operation: any) => (
              <motion.div
                key={operation.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FileOperationItem operation={operation} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function FileOperationItem({ operation }: { operation: FileOperation }) {
  const { fileName, status, progress, error } = operation;
  const isInProgress = status !== "complete" && status !== "error";

  return (
    <div className="space-y-1.5 rounded-md p-2 hover:bg-muted">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center">
          {status === "complete" ? (
            <div className="h-2 w-2 rounded-full bg-green-500" />
          ) : status === "error" ? (
            <div className="h-2 w-2 rounded-full bg-red-500" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-medium">{fileName}</div>
            <div
              className={cn(
                "ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                status === "complete" &&
                  "bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-400",
                status === "error" &&
                  "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-400",
                isInProgress &&
                  "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400",
              )}
            >
              {status === "complete"
                ? "Complete"
                : status === "error"
                  ? "Failed"
                  : "Processing"}
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
      {isInProgress && (
        <div className="pl-11 pr-2">
          <div className="flex items-center gap-2">
            <Progress value={progress} className="h-0.5 flex-1" />
            <span className="text-xs tabular-nums text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
