import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import styles from "@/styles/TextChunk.module.scss";
import Vector from "../../../public/images/Vector.svg";
import { WS_URL } from "@/constant/constant";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addElement } from "@/redux/element/elementThunks";
import { setIsOpen, setSelectedData } from "@/redux/askAi/askAiSlice";
import { fetchTableChunks, fetchTextChunks, fetchGraphChunks } from "@/redux/chunks/chunksThunks";
import { selectChunksStatus, selectGraphChunks, selectTableChunks, selectTextChunks } from "@/redux/chunks/selector";
import { setTextData } from "@/redux/chunks/chunksSlice";
import { EnhancedTextChunkProps, ChunkData } from "@/interface/components/chunks.interface";
import TextCard from "@/components/TextCard";
import GraphCard from "@/components/GraphCard";
import TableCard from "@/components/TableCard";

export default function EnhancedTextChunk({
  onAddToWorkspace,
  workspaceId,
  currentPage,
  layout,
}: EnhancedTextChunkProps) {
  const [messages, setMessages] = useState<Record<number, string[]>>({});
  const [sockets, setSockets] = useState<WebSocket[]>([]);
  const [sortedChunks, setSortedChunks] = useState<ChunkData[]>([]);

  const graphData = useSelector(selectGraphChunks);
  const tableChunksData = useSelector(selectTableChunks);
  const textChunksData = useSelector(selectTextChunks);
  //const isLoading = useSelector(selectChunksStatus);
  const socketsRef = useRef<WebSocket[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const activeDocument = useSelector(
    (state: RootState) => state.projectDocuments.activeDocument,
  );
  const sections = useSelector(
    (state: RootState) => state.documents.sections[activeDocument?.id],
  );

  useEffect(() => {
    // Clear messages so that chunks on a new page don't reuse summaries from a previous page
    setMessages({});
  }, [currentPage, activeDocument?.id]);

  // Memoized coordinate extraction functions
  const getTextChunkY1 = useCallback((chunk: any): number => {
    try {
      if (!chunk?.coordinates) return 0;

      const coordArrays = Object.values(chunk.coordinates);
      for (const coord of coordArrays) {
        if (Array.isArray(coord) && coord[0]?.[0]?.[1]) {
          return coord[0][0][1];
        }
      }
      return 0;
    } catch (error) {
      console.error("Error extracting text chunk Y1:", error);
      return 0;
    }
  }, []);

  const getChunkY1 = useCallback((chunk: any): number => {
    try {
      if (!chunk?.coordinates) return 0;

      const coordArrays = Object.values(chunk.coordinates);
      for (const coord of coordArrays) {
        if (
          Array.isArray(coord) &&
          coord.length >= 4 &&
          typeof coord[1] === "number"
        ) {
          return coord[1];
        }
      }
      return 0;
    } catch (error) {
      console.error("Error extracting chunk Y1:", error);
      return 0;
    }
  }, []);

  const handleAskAI = useCallback(
    (chunk: any, index: number, chunkType: string | null) => {
      const payload = {
        ...chunk,
        type: chunkType,
        isTableChunk: chunkType === "table",
        extractedData: chunk?.table_html || [],
        generated_title: chunk.title,
        content: chunk.description || chunk.content,
        tableId: chunk.table_id || "",
        messages: chunk.generated_title || [],
        imageSrc:
          chunk.figure_without_caption || chunk.table_without_caption || null,
        pageNumber: currentPage,
      };
      dispatch(setSelectedData(payload));
      dispatch(setIsOpen());
    },
    [dispatch, messages, currentPage],
  );

  const findSectionIndex = useCallback(
    (page: number): number | null => {
      if (!sections?.length) return null;
      return (
        sections.find(
          (section: any) =>
            page >= section.startPage && page <= section.endPage,
        )?.index ?? null
      );
    },
    [sections],
  );

  const handleAddToWorkspace = useCallback(
    async (chunk: any) => {
      try {
        const sectionName = findSectionIndex(currentPage);
        const payload = {
          workspaceId: Number(workspaceId),
          elementType: chunk.elementType || "text",
          imageCaption: chunk.tableCaption || chunk.graphCaption,
          content: chunk.content || null,
          pageNumber: currentPage || 1,
          contentTitle: chunk.generated_title || null,
          aiSummary: messages[chunk.index] || "",
          sectionName,
          htmlContent: chunk.htmlContent || null,
        };

        await dispatch(addElement(payload));
        onAddToWorkspace({
          generated_title: chunk.generated_title,
          content: chunk.content,
          section: chunk.section || "Default Section",
          sectionName,
        });
      } catch (error) {
        console.error("Error adding element:", error);
      }
    },
    [
      dispatch,
      findSectionIndex,
      currentPage,
      workspaceId,
      messages,
      onAddToWorkspace,
    ],
  );

  // Fetch chunks effect
  useEffect(() => {
    const documentId = activeDocument?.id;
    if (!documentId) return;

    const fetchChunks = async () => {
      try {
        const fetchPromises = [];
        if (!textChunksData[documentId]) {
          fetchPromises.push(dispatch(fetchTextChunks(documentId)));
        }
        if (!tableChunksData[documentId]) {
          fetchPromises.push(dispatch(fetchTableChunks(documentId)));
        }
        if (!graphData[documentId]) {
          fetchPromises.push(dispatch(fetchGraphChunks(documentId)));
        }
        await Promise.all(fetchPromises);
      } catch (error) {
        console.error("Error fetching chunks:", error);
      }
    };

    fetchChunks();
  }, [
    activeDocument?.id,
    dispatch,
    textChunksData,
    tableChunksData,
    graphData,
  ]);

  // WebSocket effect
  useEffect(() => {
    const newMessages: Record<number, string[]> = {};
    const newSockets: WebSocket[] = [];

    const createSocket = (chunk: any, index: number): WebSocket => {
      const socket = new WebSocket(WS_URL || "");

      socket.onopen = () => {
        if (
          chunk.content &&
          !textChunksData?.[activeDocument?.id]?.[String(currentPage)]?.[index]
            ?.aiSummary
        ) {
          socket.send(chunk.content.trim());
        }
      };

      socket.onmessage = (event: MessageEvent) => {
        newMessages[index] = [...(newMessages[index] || []), event.data];
        setMessages((prev) => ({
          ...prev,
          [index]: [...(prev[index] || []), event.data],
        }));
      };

      socket.onclose = () => {
        const aiSummary = newMessages[index]?.join("");
        if (aiSummary && activeDocument?.id) {
          dispatch(
            setTextData({
              currentPage,
              key: index,
              aiSummary,
              documentId: activeDocument.id,
            }),
          );
        }
      };

      socket.onerror = (error) => {
        console.error(`WebSocket error for chunk index: ${index}`, error);
      };

      return socket;
    };

    // Close previous sockets before opening new ones
    socketsRef.current.forEach((socket) => socket.close());
    socketsRef.current = [];

    const currentPageChunks =
      textChunksData?.[activeDocument?.id]?.[String(currentPage)] || [];

    currentPageChunks.forEach((chunk: any, index: number) => {
      if (!chunk.hasOwnProperty("aiSummary")) {
        newMessages[index] = [];
        const socket = createSocket(chunk, index);
        newSockets.push(socket);
      }
    });

    // Store active sockets
    socketsRef.current = newSockets;
    setSockets(newSockets);

    return () => {
      socketsRef.current.forEach((socket) => socket.close());
      socketsRef.current = [];
    };
  }, [textChunksData, currentPage, dispatch, activeDocument?.id]);

  // Sort chunks effect
  useEffect(() => {
    const getAllChunks = (): ChunkData[] => {
      const chunks: ChunkData[] = [];
      const docId = activeDocument?.id;
      const pageStr = String(currentPage);

      // Add text chunks
      (textChunksData?.[docId]?.[pageStr] || []).forEach(
        (chunk: any, index: number) => {
          chunks.push({
            type: "text",
            data: chunk,
            y1: getTextChunkY1(chunk),
            index,
          });
        },
      );

      // Add table chunks
      (tableChunksData?.[docId]?.[pageStr] || []).forEach(
        (chunk: any, index: number) => {
          chunks.push({
            type: "table",
            data: chunk,
            y1: getChunkY1(chunk),
            index,
          });
        },
      );

      // Add graph chunks
      (graphData?.[docId]?.[pageStr] || []).forEach(
        (chunk: any, index: number) => {
          if (chunk.title && chunk.type === "graph") {
            chunks.push({
              type: "graph",
              data: chunk,
              y1: getChunkY1(chunk),
              index,
            });
          }
        },
      );

      return chunks.sort((a, b) => a.y1 - b.y1);
    };

    setSortedChunks(getAllChunks());
  }, [
    currentPage,
    textChunksData,
    tableChunksData,
    graphData,
    activeDocument?.id,
    getTextChunkY1,
    getChunkY1,
  ]);

  const gridStyle = useMemo(
    () =>
      layout === "Portrait"
        ? "grid grid-cols-1 gap-2"
        : "grid grid-cols-2 gap-2",
    [layout],
  );

  return (
    <div className="flex flex-col gap-1 w-full h-screen px-2 pt-2.5 bg-transparent">
      <div className={styles.containerHeading}>
        <div className={styles.containerHeadingName}>
          <label>
            <Image src={Vector} alt="Vector" />
          </label>
          <h3 className={styles.heading}>AI Summary</h3>
        </div>
        <div className={styles.pageNumber}>
          <p>{currentPage}</p>
        </div>
      </div>

      <div className="overflow-y-auto scrollbar-hide pb-[500px] h-full">
        <div className={gridStyle}>
          {sortedChunks.map((chunk) => {
            switch (chunk.type) {
              case "text":
                return (
                  <div className="flex flex-col gap-4">
                    <TextCard
                      textData={chunk.data}
                      messages={messages}
                      onAddToWorkspace={handleAddToWorkspace}
                      onAskAI={handleAskAI}
                      variant='chunks'
                      index={chunk.index} />
                  </div>
                );
              case "table":
                return (
                  <>
                    <TableCard
                      tableData={chunk.data}
                      variant="chunks"
                      index={chunk.index}
                      messages={messages}
                      onAskAI={handleAskAI}
                      onAddToWorkspace={handleAddToWorkspace}
                    />
                  </>
                );
              case "graph":
                return (
                  <>
                    <GraphCard
                      graphData={chunk.data}
                      variant="chunks"
                      index={chunk.index}
                      messages={messages}
                      pageNumber={currentPage}
                      onAskAI={handleAskAI}
                      onAddToWorkspace={handleAddToWorkspace}
                    />
                  </>
                );
              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
