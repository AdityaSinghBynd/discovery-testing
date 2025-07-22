import React, { useMemo } from "react";
import Tabs from "@/components/Tabs";
import Image from "next/image";
import NoDocument from "../../../public/images/noDocument.svg";
import PdfIcon from "../../../public/images/pdfIcon.svg";
import { CloudUpload } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { type FileOperation, useToastStore } from "@/store/useTostStore";
import { Progress } from "@/components/ui/progress";

const FileOperationItem = ({ operation }: { operation: FileOperation }) => {
  const { fileName, status, progress, error } = operation;
  const isInProgress = status !== "complete" && status !== "error";

  return (
    <div className="space-y-1.5 rounded-md p-2 hover:bg-muted">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center">
          <Image src={PdfIcon} alt="PDF Icon" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-medium">{fileName}</div>
          </div>
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {isInProgress && (
            <div className="mt-1.5 pr-2">
              <div className="flex items-center gap-3">
                <Progress value={progress} className="h-1 flex-1" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DocumentNavigator = () => {
  const { operations } = useToastStore();

  const deduplicated = useMemo(() => {
    const fileNameMap = new Map<string, FileOperation>();
    
    // Sort operations by timestamp (newest first)
    const sortedOps = [...operations].sort((a, b) => b.timestamp - a.timestamp);
    
    // Process operations in order (newest first)
    for (const op of sortedOps) {
      const normalizedName = op.fileName.replace(/\.\w+$/, '').trim().toLowerCase();
      
      if (fileNameMap.has(normalizedName)) {
        const existingOp = fileNameMap.get(normalizedName)!;
        
        // Priority: processing/uploading > error > complete
        if (
          (existingOp.status === "processing" || existingOp.status === "uploading") ||
          (existingOp.status === "error" && op.status === "complete")
        ) {
          continue;
        }
      }
      
      fileNameMap.set(normalizedName, op);
    }

    return Array.from(fileNameMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [operations]);

  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <div className="flex-1 flex items-center min-w-0">
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <Tabs />
        </div>
        {/* <div className="flex items-center gap-2 pl-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <CloudUpload className={`h-6 w-6 cursor-pointer text-[#4e5971]`} />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[450px] mt-2 bg-white p-1 rounded shadow-custom-blue border-1 border-[eaf0fc]">
              {operations.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {deduplicated.map((operation) => (
                    <FileOperationItem key={operation.id} operation={operation} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-2 text-sm">
                  <Image src={NoDocument} alt="No Document Selected" width={40} height={40}/>
                  <p className="text-md text-[#001742]">No active file operations</p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}
      </div>
    </div>
  );
};

export default DocumentNavigator;
