import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

export const useDiscoverySocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();

  const connectSocket = useCallback(() => {
    if (!process.env.NEXT_PUBLIC_SOCKET_URL) {
      console.error("Socket URL not configured");
      return null;
    }

    if (socketRef.current?.connected) return socketRef.current;

    try {
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket'],
      });

      socket.on("connect", () => console.log("Socket connected successfully"));
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

  useEffect(() => {
    // Only connect if we're on a discovery path
    if (router.pathname.startsWith('/discovery')) {
      const socket = connectSocket();

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [router.pathname, connectSocket]);

  return {
    socket: socketRef.current,
    connectSocket,
  };
}; 