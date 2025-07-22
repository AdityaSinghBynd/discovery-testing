import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import ProgressBar from "../ProgressBar";
import fileUploadIcon from "../../../public/images/uploadPDFIcon.svg";
import uploadIcon from "../../../public/images/upload.svg";
import actionIcon from "../../../public/images/Action.svg";
import errorIcon from "../../../public/images/alert.svg";
import styles from "@/styles/FileUpload.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { uploadDocument } from "@/redux/recentUploadedDocuments/recentUploadedThunks";
import { useToastStore } from "@/store/useTostStore";

const Index: React.FC<any> = ({}: any) => {
  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: {
      file: File;
      progress: number;
      completed: boolean;
      error: string;
    };
  }>({});
  const [isDragActive, setIsDragActive] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const status = useSelector((state: RootState) => state.recentUploaded.status);
  const { addOperation, updateOperation } = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => handleFile(file));
    }
    event.target.value = "";
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    Array.from(files).forEach((file) => handleFile(file));
  };

  const handleFile = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;

    if (!file.type.includes("pdf")) {
      setUploadedFiles((prev) => ({
        ...prev,
        [fileId]: {
          file,
          progress: 0,
          completed: false,
          error: `${file.name} failed to import because of invalid file format`,
        },
      }));
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setUploadedFiles((prev) => ({
        ...prev,
        [fileId]: {
          file,
          progress: 0,
          completed: false,
          error: `${file.name} failed to import because it exceeds the maximum size of 100MB`,
        },
      }));``
      return;
    }

    setUploadedFiles((prev) => ({
      ...prev,
      [fileId]: {
        file,
        progress: 0,
        completed: false,
        error: "",
      },
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      await dispatch(
        uploadDocument({
          payload: formData,
          onProgress: (progress) => {
            setUploadedFiles((prev) => ({
              ...prev,
              [fileId]: {
                ...prev[fileId],
                progress,
                completed: progress === 100,
              },
            }));
          },
        }),
      );

      if (status === "succeeded") {
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadedFiles((prev) => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          error: "Failed to upload file. Please try again.",
        },
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => handleFile(file));
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleEditFileName = (fileId: string, newName: string) => {
    const file = uploadedFiles[fileId].file;
    const newFile = new File([file], newName + ".pdf", {
      type: file.type,
    });

    setUploadedFiles((prev) => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        file: newFile,
      },
    }));
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[fileId];
      return newFiles;
    });
  };

  const formatFileSize = (size: number) => {
    return (size / 1024).toFixed(2);
  };

  return (
    <div className={styles.Uploadcontainer}>
      <div
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onClick={handleBoxClick}
        onDrop={handleDrop}
        style={isDragActive ? dropzoneActiveStyles : dropzoneStyles}
        className={styles.formContainerBox}
      >
        <div className={styles.formContainerBoxText}>
          <Image alt="upload-icon" src={uploadIcon} width={120} />
          <label htmlFor="fileInput">
            <b>
              <span>Upload documents / folders</span>
            </b>
            <p>PDF(Max Size: 25MB per file)</p>
          </label>
        </div>

        <input
          type="file"
          id="fileInput"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: "none" }}
          accept=".pdf"
          multiple
        />
      </div>

      {Object.entries(uploadedFiles).map(([fileId, fileData]) => (
        <div key={fileId}>
          {fileData.error ? (
            <div className={styles.errorMessage}>
              <Image src={errorIcon} alt="Error" />
              <span>{fileData.error}</span>
            </div>
          ) : (
            <div
              className={styles.selectedFile}
              style={{
                backgroundColor: fileData.completed ? "#ECFDF3" : "white",
                transition: "background-color 0.3s ease",
                borderColor: fileData.completed ? "#d1fadf" : "#DEE6F5",
              }}
            >
              <div className={styles.selectedFileContainer}>
                <div className={styles.selectedFileContainerBox}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <Image
                      src={fileUploadIcon}
                      alt="file-upload-icon"
                      width={34}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <input
                        className={styles.selectedFileInput}
                        value={fileData?.file?.name?.replace(/\.pdf$/i, "")}
                        onChange={(e) =>
                          handleEditFileName(fileId, e.target.value)
                        }
                        disabled={fileData.completed}
                      />
                      {fileData.completed ? (
                        <div className={styles.selectedFileDetails}>
                          <p>
                            {formatFileSize(fileData?.file?.size)} KB |{" "}
                            {new Date().toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <ProgressBar progress={fileData.progress} />
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className={styles.selectedFileCrossButton}
                  onClick={() => removeFile(fileId)}
                >
                  <Image src={actionIcon} alt="Cross Button" width={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const dropzoneStyles: React.CSSProperties = {
  width: "100%",
  borderRadius: "6px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const dropzoneActiveStyles: React.CSSProperties = {
  ...dropzoneStyles,
  border: "1px dashed var(--Border-Interactive, #004CE6)",
  backgroundColor: "#EEF4FF",
};

export default Index;
