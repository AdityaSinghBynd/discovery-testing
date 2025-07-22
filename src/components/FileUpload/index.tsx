import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import ProgressBar from "../ProgressBar";
import fileUploadIcon from "../../../public/images/uploadPDFIcon.svg";
import uploadIcon from "../../../public/images/upload.svg";
import errorIcon from "../../../public/images/alert.svg";
import { FileUploadProps } from "@/types/upload";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setSelectedProjectDocuments } from "@/redux/projectDocuments/projectDocumentsSlice";
import { useToast } from "@/hooks/use-toast";
import { truncateText } from "@/utils/utils";
import { useSocket } from "@/context/SocketContext";

const getUniqueDocumentName = (baseName: string, existingDocs: Array<{ name: string }>) => {
  const nameWithoutExt = baseName.replace(/\.pdf$/i, "");

  if (!existingDocs.some(doc => doc.name === nameWithoutExt)) {
    return nameWithoutExt;
  }

  const regex = new RegExp(`^${nameWithoutExt}(?:\\((\\d+)\\))?$`);
  const numbers = existingDocs
    .map(doc => {
      const match = doc.name.match(regex);
      return match ? parseInt(match[1] || "0") : -1;
    })
    .filter(num => num !== -1);

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `${nameWithoutExt}(${nextNumber})`;
};

interface DocumentResponse {
  id?: number | string;
  name?: string;
  status?: string;
  url?: string;
  fileId?: string | number;
  success?: boolean;
  error?: string;
}

const MAX_FILES_LIMIT = 5;
const MAX_PAGES_LIMIT = 1000;

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadedFiles, handleFile, updateFileName, removeFile } = useFileUpload();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { simulateFileUpload } = useSocket();
  const selectedDocs = useSelector(
    (state: RootState) => state.projectDocuments.selectedDocuments
  );
  const recentUploadedDocuments = useSelector(
    (state: RootState) => state.recentUploaded.recentUploadedDocuments
  );

  const checkPDFPageCount = useCallback(async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          let pageCount = 0;
          const pagePattern = /\/Type\s*\/Page[^s]/g;

          const chunkSize = 8192;
          let text = '';

          for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, Math.min(i + chunkSize, data.length));
            text += String.fromCharCode.apply(null, Array.from(chunk));
          }

          const matches = text.match(pagePattern);
          pageCount = matches ? matches.length : 0;

          resolve(pageCount);
        } catch (error) {
          console.error("Error counting PDF pages:", error);
          resolve(0);
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };

      // Use readAsArrayBuffer for binary files like PDFs
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const processFiles = useCallback(async (files: File[]) => {
    // Check if total files would exceed the limit
    const currentUploadCount = Object.keys(uploadedFiles).length;
    const totalFilesAfterUpload = currentUploadCount + files.length;

    if (totalFilesAfterUpload > MAX_FILES_LIMIT) {
      toast({
        title: "Upload Limit Exceeded",
        description: `You can only upload a maximum of ${MAX_FILES_LIMIT} files per session.`,
        variant: "destructive",
      });
      return;
    }

    // Filter valid files and check page count for each PDF
    const validFiles = [];
    for (const file of files) {
      try {
        // First check if it's a PDF
        if (!file.type.includes('pdf')) {
          toast({
            title: "Invalid File Type",
            description: `${file.name} is not a PDF file.`,
            variant: "destructive",
          });
          continue;
        }

        const pageCount = await checkPDFPageCount(file);
        if (pageCount > MAX_PAGES_LIMIT) {
          toast({
            title: "Page Limit Exceeded",
            description: `${file.name} has more than ${MAX_PAGES_LIMIT} pages (${pageCount} pages).`,
            variant: "destructive",
          });
          continue;
        }

        const uniqueName = getUniqueDocumentName(
          file.name,
          recentUploadedDocuments
        );

        const renamedFile = new File([file], uniqueName + '.pdf', {
          type: file.type,
          lastModified: file.lastModified
        });

        validFiles.push(renamedFile);
      } catch (error) {
        toast({
          title: "File Validation Error",
          description: `Error validating ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
          variant: "destructive",
        });
      }
    }

    // Process valid files
    const uploadPromises = validFiles.map(async (file) => {
      try {
        const result = await handleFile(file) as DocumentResponse;

        if (result?.success) {
          onUploadSuccess?.(file);

          const documentId = result.id;
          const documentName = file.name.replace(/\.pdf$/i, ""); // Use the already unique name

          if (documentId) {
            dispatch(setSelectedProjectDocuments({
              id: documentId,
              name: documentName
            }));

            // Initialize socket connection for the uploaded document
            const uploadedDoc = recentUploadedDocuments.find(doc => doc.id === documentId);
            if (uploadedDoc && (uploadedDoc.status === "loading" || uploadedDoc.status === "processing")) {
              simulateFileUpload({
                ...uploadedDoc,
                name: documentName
              });
            }
          }
        } else if (result?.error) {
          onUploadError?.(result.error);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        onUploadError?.(error instanceof Error ? error.message : "Upload failed");
      }
    });

    await Promise.all(uploadPromises);
  }, [handleFile, onUploadSuccess, onUploadError, dispatch, toast, uploadedFiles, checkPDFPageCount, recentUploadedDocuments, simulateFileUpload]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await processFiles(Array.from(files));
    }
    event.target.value = "";
  }, [processFiles]);

  const handleDragEvents = useCallback((e: React.DragEvent, isDragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(isDragging);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFiles(Array.from(files));
    }
  }, [processFiles]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Check if a document is selected
  const isDocumentSelected = useCallback((docId: string) => {
    return selectedDocs.some(doc => doc.id === docId);
  }, [selectedDocs]);

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onClick={triggerFileInput}
        onDrop={handleDrop}
        className={`w-full rounded flex flex-col items-center justify-center cursor-pointer border-1 p-6 transition-all duration-300 ${isDragActive ? "border-[#004CE6] border-dashed bg-[#EEF4FF]" : "border-[#eaf0fc] border-dashed bg-white"
          }`}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Image alt="upload-icon" src={uploadIcon} width={120} />
          <label className="flex flex-col gap-1">
            <b>
              <span className="font-medium">Upload documents</span>
            </b>
            <p className="text-xs">PDF(Max Size: 100MB per file)</p>
            <p className="text-xs">5 files per session. Each PDF must be under 1,000 pages.</p>
          </label>
        </div>

        <input
          type="file"
          id="fileInput"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf"
          multiple
        />
      </div>

      {Object.entries(uploadedFiles).map(([fileId, fileData]) => (
        <div key={fileId}>
          {fileData.error ? (
            <div className="flex items-center gap-2 p-2 rounded bg-[#FEF3F2] border border-[#FEE4E2]">
              <Image src={errorIcon} alt="Error" width={20} height={20} />
              <span className="text-[#B42318] text-sm">{fileData.error}</span>
            </div>
          ) : (
            <div
              className={`border-1 rounded p-2 transition-all duration-300 ${fileData.completed
                ? "bg-[#004CE608] border-[#eaf0fc]"
                : "bg-white border-[#eaf0fc]"
                }`}
            >
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Image
                      src={fileUploadIcon}
                      alt="file-upload-icon"
                      width={16}
                      height={16}
                    />
                    <div className="flex flex-col w-full h-full">
                      <input
                        className={`border-none bg-transparent text-sm w-full rounded
                          focus:outline-none focus:bg-black/5`}
                        value={truncateText(fileData.file.name.replace(/[_\.]pdf$/i, ""), 90)}
                        onChange={(e) => updateFileName(fileId, e.target.value)}
                        disabled={fileData.completed}
                      />
                      {!fileData.completed && (
                        <ProgressBar progress={fileData.progress} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FileUpload;