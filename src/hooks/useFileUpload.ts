import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { v4 as uuidv4 } from 'uuid';
import { addRecentUpload, removeRecentUpload, updateUploadStatus } from '@/redux/recentUploadedDocuments/recentUploadedSlice';
import { uploadDocument } from "@/redux/recentUploadedDocuments/recentUploadedThunks";

interface UploadedFile {
  file: File;
  progress: number;
  completed: boolean;
  error?: string;
}

interface UploadedFiles {
  [key: string]: UploadedFile;
}

interface DocumentResponse {
  id?: number | string;
  name?: string;
  status?: string;
  url?: string;
  [key: string]: any;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

export const useFileUpload = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({});

  const handleFile = useCallback(async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;

    try {
      setUploadedFiles(prev => ({
        ...prev,
        [fileId]: { file, progress: 0, completed: false }
      }));

      dispatch(addRecentUpload({
        id: fileId,
        name: file.name,
        createdAt: new Date().toISOString(),
        status: 'loading'
      }));

      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds 100MB limit`);
      }

      if (!file.type.includes('pdf')) {
        throw new Error(`Only PDF files are allowed`);
      }

      const formData = new FormData();
      formData.append('file', file);

      const result = await dispatch(
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

      // On successful upload
      setUploadedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[fileId];
        return newFiles;
      });

      if (uploadDocument.fulfilled.match(result)) {
        dispatch(removeRecentUpload(fileId));
        
        const responseData = result.payload as DocumentResponse | DocumentResponse[];
        // Return the document data directly if it exists
        if (responseData && !Array.isArray(responseData) && responseData.id) {
          return { ...responseData, success: true };
        }
        // If it's an array, return the first document
        else if (responseData && Array.isArray(responseData) && responseData.length > 0 && responseData[0].id) {
          return { ...responseData[0], success: true };
        } 
        // Fallback to the old way
        else {
          dispatch(updateUploadStatus({ id: fileId, status: 'completed' }));
          return { fileId, success: true };
        }
      } else {
        dispatch(updateUploadStatus({ id: fileId, status: 'completed' }));
        return { fileId, success: true };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[fileId];
        return newFiles;
      });
      dispatch(updateUploadStatus({ id: fileId, status: 'failed' }));

      return { fileId, success: false, error: errorMessage };
    }
  }, [dispatch]);

  const updateFileName = useCallback((fileId: string, newName: string) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        file: new File([prev[fileId].file], `${newName}.pdf`, {
          type: prev[fileId].file.type
        })
      }
    }));
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[fileId];
      return newFiles;
    });
    dispatch(removeRecentUpload(fileId));
  }, [dispatch]);

  const resetUploadedFiles = useCallback(() => {
    setUploadedFiles({});
  }, []);

  return {
    uploadedFiles,
    handleFile,
    updateFileName,
    removeFile,
    resetUploadedFiles
  };
}; 