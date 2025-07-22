import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { useToastStore } from '@/store/useTostStore';
import { updateStatus } from '@/redux/recentUploadedDocuments/recentUploadedSlice';

interface FileUpload {
  id: string;
  name: string;
  status: string;
}

export const useSocketConnection = () => {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);
  const retryAttemptsRef = useRef<{ [key: string]: number }>({});
  const MAX_RETRY_ATTEMPTS = 3;
  const { addOperation, updateOperation } = useToastStore();

  const connectSocket = useCallback(() => {
    if (!process.env.NEXT_PUBLIC_SOCKET_URL) {
      console.error("Socket URL not configured");
      return null;
    }

    if (socketRef.current?.connected) {
      return socketRef.current;
    }

    try {
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        toast.error("Connection error. Retrying...");
      });

      socketRef.current = socket;
      return socket;
    } catch (error) {
      console.error("Failed to initialize socket:", error);
      toast.error("Failed to establish connection");
      return null;
    }
  }, []);
  
  // Handle file upload simulation with retry logic
  const simulateFileUpload = useCallback(
    async (file: FileUpload) => {
      const fileId = file.id;
      console.log("fileId", fileId);
      const operationId = `progress_${fileId}`;

      const operations = useToastStore.getState().operations;
      if (operations.find((op) => op.id === operationId)) {
        return;
      }

      addOperation({
        id: operationId,
        fileName: file.name,
        status: file.status === "completed" ? "complete" : file.status === "failed" ? "error" : "processing",
        progress: 30,
        type: "upload",
      });

      const handleUpload = async () => {
        try {
          if (!socketRef.current) {
            socketRef.current = connectSocket();
            if (!socketRef.current)
              throw new Error("Failed to establish socket connection");
          }

          socketRef.current.on(operationId, (data: number) => {
            updateOperation(operationId, { progress: data });

            if (data >= 100) {
              updateOperation(operationId, {
                status: "complete",
                progress: 100,
              });
              dispatch(
                updateStatus({
                  fileId,
                  status: "completed",
                }),
              );
              socketRef.current?.off(operationId);
              retryAttemptsRef.current[operationId] = 0;
            }
          });
        } catch (error) {
          const attempts = (retryAttemptsRef.current[operationId] || 0) + 1;
          retryAttemptsRef.current[operationId] = attempts;

          if (attempts <= MAX_RETRY_ATTEMPTS) {
            console.warn(`Retry attempt ${attempts} for file ${file.name}`);
            setTimeout(() => handleUpload(), 1000 * attempts);
          } else {
            updateOperation(operationId, {
              status: "error",
              error:
                error instanceof Error
                  ? error.message
                  : "Upload failed after multiple attempts",
            });
            toast.error(
              `Failed to upload ${file.name} after ${MAX_RETRY_ATTEMPTS} attempts`,
            );
          }
        }
      };

      await handleUpload();
    },
    [addOperation, updateOperation, dispatch, connectSocket],
  );

  // Cleanup function for socket connection
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return {
    simulateFileUpload,
    connectSocket,
    socket: socketRef.current,
  };
}; 