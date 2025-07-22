import { useState, useEffect, useCallback, useRef } from 'react';

export type ProgressEventData = {
  documentId: number | string;
  stage: string;
  progress: number;
  status: 'started' | 'in_progress' | 'completed' | 'failed' | 'queued' | 'pending';
  message: string;
  duration?: string;
  error?: string;
};

export type UseServerSideEventOptions = {
  /**
   * If true, will connect automatically on mount.
   * If false, you must call connect() manually.
   * Default: true
   */
  autoConnect?: boolean;
  /**
   * If true, will disconnect on unmount.
   * Default: true
   */
  autoDisconnect?: boolean;
  /**
   * Optionally provide a custom SSE URL.
   * If not provided, will use process.env.NEXT_PUBLIC_SSE_URL + '/api/v1/sse/test-events'
   */
  sseUrl?: string;
};

type ConnectionStatus =
  | 'Disconnected'
  | 'Connecting...'
  | 'Connected'
  | 'Error (check console)'
  | 'Disconnected (server closed)';

export function useServerSideEvent(
  options: UseServerSideEventOptions = {}
) {
  const {
    autoConnect = true,
    autoDisconnect = true,
    sseUrl = process.env.NEXT_PUBLIC_SSE_URL
      ? process.env.NEXT_PUBLIC_SSE_URL + '/api/v1/sse/test-events'
      : '',
  } = options;

  const [progressEvents, setProgressEvents] = useState<ProgressEventData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('Disconnected');
  const eventSourceRef = useRef<EventSource | null>(null);

  // Connect to SSE
  const connect = useCallback(() => {
    if (!sseUrl) {
      setConnectionStatus('Error (check console)');
      console.error('SSE URL is not defined.');
      return;
    }
    if (eventSourceRef.current) {
      // Already connected or connecting
      return;
    }

    setConnectionStatus('Connecting...');
    // For withCredentials support, use EventSourcePolyfill if needed
    // For now, use native EventSource
    const es = new EventSource(sseUrl);

    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionStatus('Connected');
    };

    es.onmessage = (event: MessageEvent) => {
      // Enhanced logging for event.data and the event object itself
      // It's possible that some messages are not JSON and should be handled differently
      if (event.data && typeof event.data === 'string' && event.data.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(event.data);
          // Accept both {data: ...} and direct event
          const newEvent: ProgressEventData = parsed.data ?? parsed;
          setProgressEvents((prevEvents) => {
            // Prevent duplicates by documentId+stage+status
            const filtered = prevEvents.filter(
              (e) =>
                !(
                  e.documentId === newEvent.documentId &&
                  e.stage === newEvent.stage &&
                  e.status === newEvent.status
                )
            );
            return [newEvent, ...filtered].slice(0, 50);
          });
        } catch (e) {
          // Optionally, you could set an error state
          // console.error('Failed to parse JSON event data:', e, 'Raw data was:', `>>${event.data}<<`);
        }
      } else if (event.data) {
        // Handle non-JSON data, or log it specifically if it's not expected
        // Optionally, you could update state here if non-JSON messages are meaningful
      }
    };

    es.onerror = (error) => {
      setConnectionStatus('Error (check console)');
      if (es.readyState === EventSource.CLOSED) {
        setConnectionStatus('Disconnected (server closed)');
        es.close();
        eventSourceRef.current = null;
      }
    };
  }, [sseUrl]);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setConnectionStatus('Disconnected');
    }
  }, []);

  // Optionally auto-connect/disconnect
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      if (autoDisconnect) {
        disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, autoDisconnect, connect, disconnect, sseUrl]);

  return {
    progressEvents,
    connectionStatus,
    connect,
    disconnect,
    isConnected: connectionStatus === 'Connected',
    isConnecting: connectionStatus === 'Connecting...',
    isDisconnected: connectionStatus === 'Disconnected' || connectionStatus === 'Disconnected (server closed)',
    eventSource: eventSourceRef.current,
  };
}
