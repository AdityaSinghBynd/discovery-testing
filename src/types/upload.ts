export interface FileUploadProps {
  onUploadSuccess?: (file: File) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number; 
  acceptedFileTypes?: string[];
}

export interface UploadedFileData {
  file: {
    name: string;
  };
  completed?: boolean;
  progress?: number;
  error?: string;
}

export interface UploadedFiles {
  [key: string]: UploadedFileData;
}

export interface RecentUpload {
  id: string;
  name: string;
  date: string;
  status: 'loading' | 'completed' | 'failed';
}

export type FileValidationResult = {
  isValid: boolean;
  error?: string;
} 