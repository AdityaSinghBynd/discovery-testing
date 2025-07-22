import { FileValidationResult } from '../types/upload';

export const FILE_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB in bytes
export const ACCEPTED_FILE_TYPES = ['application/pdf'];

export const validateFile = (file: File): FileValidationResult => {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `${file.name} failed to import because of invalid file format`,
    };
  }

  if (file.size > FILE_SIZE_LIMIT) {
    return {
      isValid: false,
      error: `${file.name} failed to import because it exceeds the maximum size of 100MB`,
    };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const generateFileId = (file: File): string => {
  return `${file.name}-${Date.now()}`;
};

export const createFileWithNewName = (file: File, newName: string): File => {
  return new File([file], `${newName}.pdf`, { type: file.type });
}; 