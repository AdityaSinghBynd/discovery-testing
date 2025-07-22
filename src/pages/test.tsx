import React from 'react';
import { useServerSideEvent } from '../hooks/ServerSideEvent/useServerSideEvent';

// Define the shape of your progress event data for TypeScript
interface ProgressEventData {
  documentId: number | string;
  stage: string;
  progress: number;
  status: 'started' | 'in_progress' | 'completed' | 'failed' | 'queued' | 'pending';
  message: string;
  duration?: string;
  error?: string;
}

const ProgressDisplay: React.FC = () => {
  // Use the custom hook to manage SSE connection and state
  const {
    progressEvents,
    connectionStatus,
    connect,
    disconnect,
    isConnected,
    isConnecting,
    isDisconnected,
    eventSource,
  } = useServerSideEvent({
    autoConnect: true,
    autoDisconnect: true,
    sseUrl: process.env.NEXT_PUBLIC_SSE_URL
      ? process.env.NEXT_PUBLIC_SSE_URL + '/api/v1/sse/progress'
      : '',
  });

  return (
    <div>
      <h2>Document Processing Progress</h2>
      <p>Status: {connectionStatus}</p>
      <div>
        <button
          onClick={connect}
          disabled={isConnected || isConnecting}
        >
          Connect to Progress Stream
        </button>
        <button
          onClick={disconnect}
          disabled={isDisconnected || isConnecting}
          style={{ marginLeft: '10px' }}
        >
          Disconnect
        </button>
      </div>

      <div
        style={{
          border: '1px solid #ccc',
          padding: '15px',
          marginTop: '20px',
          maxHeight: '400px',
          overflowY: 'auto',
          backgroundColor: '#f9f9f9',
        }}
      >
        {progressEvents.length === 0 && <p>Waiting for events...</p>}
        {progressEvents.map((event, index) => (
          <div
            key={`${event.documentId}-${event.stage}-${event.status}-${index}`}
            style={{
              padding: '8px',
              borderBottom: '1px solid #eee',
              fontSize: '0.9em',
              color:
                event.status === 'completed'
                  ? 'green'
                  : event.status === 'failed'
                  ? 'red'
                  : 'inherit',
            }}
          >
            <strong>Document ID:</strong> {event.documentId} <br />
            <strong>Stage:</strong> {event.stage} <br />
            <strong>Status:</strong> {event.status} ({event.progress}%)
            <br />
            <strong>Message:</strong> {event.message}
            {event.duration && (
              <>
                <br />
                <strong>Duration:</strong> {event.duration}
              </>
            )}
            {event.error && (
              <>
                <br />
                <strong>Error:</strong> {event.error}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressDisplay;