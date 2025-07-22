import { Socket } from 'socket.io-client';

/**
 * Creates a normalized version of a filename for comparison
 * @param name The original filename
 * @returns Normalized filename without extension, trimmed, and lowercase
 */
export const normalizeFileName = (name: string): string => {
  return name.replace(/\.\w+$/, '').trim().toLowerCase();
};

/**
 * Safely removes socket event listeners
 * @param socket The socket instance
 * @param eventNames Array of event names to remove listeners from
 */
export const removeSocketListeners = (socket: Socket | null, eventNames: string[]): void => {
  if (!socket) return;
  
  eventNames.forEach(eventName => {
    socket.off(eventName);
  });
};

/**
 * Generates a unique operation ID for tracking file progress
 * @param fileId The ID of the file
 * @returns Unique operation ID
 */
export const getOperationId = (fileId: string): string => {
  return `progress_${fileId}`;
};

/**
 * Creates a backoff delay based on attempt number
 * @param attempt The current attempt number
 * @param baseDelay The base delay in milliseconds
 * @returns Calculated delay time with exponential backoff
 */
export const calculateBackoffDelay = (attempt: number, baseDelay = 1000): number => {
  return Math.min(baseDelay * Math.pow(1.5, attempt), 10000); // Max 10 seconds
};

/**
 * Maps backend document status to FileStatus type used in the UI
 * @param backendStatus Status string from backend
 * @returns Corresponding FileStatus for use in UI
 */
export const mapBackendStatusToUI = (backendStatus: string): string => {
  switch(backendStatus) {
    case "loading":
      return "uploading";
    case "processing":
      return "processing";
    case "completed":
      return "complete";
    case "failed":
      return "error";
    default:
      return "processing";
  }
};

/**
 * Gets the initial progress value based on status
 * @param status The current document status
 * @returns Initial progress percentage
 */
export const getInitialProgress = (status: string): number => {
  switch(status) {
    case "loading":
      return 20;
    case "processing":
      return 40;
    case "completed":
      return 100;
    case "failed":
      return 0;
    default:
      return 0;
  }
}; 