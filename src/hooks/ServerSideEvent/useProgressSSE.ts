
import { updateActiveDocumentStatus } from "@/redux/projectDocuments/projectDocumentsSlice";
import { useToastStore } from "@/store/useTostStore";
import { useEffect, useRef } from "react";
import { useServerSideEvent } from "./useServerSideEvent";

/**
 * Hook to listen to progress of a list of documents via server side event (SSE).
 * Uses the shared useServerSideEvent hook for connection management.
 *
 * This version logs the eventSource type and its properties for debugging,
 * as seen in the prompt example.
 */
export function useSSEDocumentProgress(activeDocuments: any[], slug: any, dispatch: any) {
  const { operations } = useToastStore();
  const { addOperation, updateOperation } = useToastStore.getState();

  // Keep a ref to the last eventSource to debug and ensure listeners are attached to the correct instance

  // Use the shared SSE hook, but do not auto-connect; connect manually when needed
  const {
    connect,
    disconnect,
    eventSource,
  } = useServerSideEvent({
    autoConnect: false,
    autoDisconnect: false,
    sseUrl: process.env.NEXT_PUBLIC_SSE_URL
      ? process.env.NEXT_PUBLIC_SSE_URL + '/api/v1/sse/progress'
      : '',
  });

  useEffect(() => {
    // Log the eventSource type and its properties for debugging
    if (eventSource) {
        eventSource.onmessage = handleMessage;
        eventSource.onerror = handleError;
      // Print a detailed log of the eventSource object, similar to the prompt
      console.log(
        "useProgressSSE.ts: eventSource type EventSource",
        {
          url: eventSource.url,
          withCredentials: eventSource.withCredentials,
          readyState: eventSource.readyState,
          onopen: eventSource.onopen,
          onmessage: eventSource.onmessage,
          onerror: eventSource.onerror,
          // Show prototype for completeness
          __proto__: Object.getPrototypeOf(eventSource)
        }
      );
    }

    // Disconnect and cleanup if no docs or slug
    if (!Array.isArray(activeDocuments) || activeDocuments.length === 0 || !slug) {
      disconnect();
      return;
    }

    // Filter documents that are in a processing/loading state
    const processingDocs = activeDocuments.filter(
      (doc: any) => ['loading', 'processing'].includes(doc.status)
    );

    if (processingDocs.length === 0) {
      disconnect();
      return;
    }

    // If eventSource is closed (readyState === 2), disconnect and reconnect
    if (eventSource && eventSource.readyState === 2) {
      console.log("useProgressSSE.ts: eventSource is CLOSED (readyState 2), disconnecting and reconnecting...");
      disconnect();
      setTimeout(() => {
        connect();
      }, 100); // slight delay to allow disconnect to finish
      return;
    }

    // Only connect if eventSource is not open (readyState !== 1)
    if (!eventSource || eventSource.readyState !== 1) {
      connect();
    }

    // Handler for incoming SSE messages
    function handleMessage(event: MessageEvent) {
      // If this is not a JSON object, ignore
      if (!event.data || typeof event.data !== 'string' || !event.data.trim().startsWith('{')) {
        return;
      }
      console.log("useProgressSSE.ts: handleMessage triggered", event);
      try {
        const parsed = JSON.parse(event.data);
        // Accept both {data: ...} and direct event
        const data = parsed.data ?? parsed;

        // Find the document this event is for
        const docId = data.documentId ?? data.id;
        if (!docId) return;

        const operationId = `progress_${docId}`;

        if (typeof data.progress === "number") {
          updateOperation(operationId, {
            id: operationId,
            progress: data.progress,
            status: data.status || "processing",
          });
        }

        if (data.status === "complete" || data.status === "completed") {
          updateOperation(operationId, {
            id: operationId,
            progress: 100,
            status: "complete",
          });
          dispatch(updateActiveDocumentStatus({ status: "completed", documentId: docId }));
        }

        if (data.status === "error" || data.status === "failed") {
          updateOperation(operationId, {
            id: operationId,
            status: "error",
            error: data.error || "Unknown error",
          });
        }
      } catch (err) {
        console.error("useProgressSSE.ts: JSON parse error in handleMessage", err, event.data);
      }
    }

    // Handler for SSE errors
    function handleError(event: Event) {
      console.error("useProgressSSE.ts: SSE error event", event);
      // If eventSource is closed, disconnect and reconnect
      if (eventSource && eventSource.readyState === 2) {
        disconnect();
        setTimeout(() => {
          connect();
        }, 100);
      }
      // Only disconnect if eventSource is not open
      else if (eventSource && eventSource.readyState !== 1) {
        disconnect();
      }
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      disconnect();
    };

  }, [
    activeDocuments,
    slug,
    dispatch,
    connect,
    disconnect,
    eventSource,
    operations,
  ]);
}
