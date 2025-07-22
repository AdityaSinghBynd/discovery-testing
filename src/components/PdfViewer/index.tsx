import { useEffect, useRef, useState, useCallback } from "react";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import {
  highlightPlugin,
  Trigger,
  RenderHighlightsProps,
} from "@react-pdf-viewer/highlight";
import { debounce } from "lodash";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import { useDispatch, useSelector } from "react-redux";
import React, { memo } from "react";
import ToolBar from "@/components/ToolBar";
import { AppDispatch, RootState } from "@/store/store";
import { setSelectedData, setIsOpen } from "@/redux/askAi/askAiSlice";
// import { setPageDimensionState } from "@/redux/pageDimension/pageDimensionSlice";
import { addElement } from "@/redux/element/elementThunks";
import { findSectionIndex } from "@/utils/utils";
import { selectTableChunks, selectGraphChunks } from "@/redux/chunks/selector";
import {
  Coordinates,
  PdfHighlightViewerProps,
  PageDimensions,
} from "@/interface/components/pdfViewer.interface";
// Constants
const WORKER_URL =
  "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
const RESIZE_DEBOUNCE_TIME = 150;
const BORDER_ADJUSTMENT = 2;

// Styles
const styles = {
  highlightWrapper: {
    position: "absolute" as const,
    inset: 0,
    pointerEvents: "none" as const,
  },
  highlightArea: {
    position: "absolute" as const,
    backgroundColor: "transparent",
    pointerEvents: "auto" as const,
    borderRadius: "8px",
    cursor: "pointer",
    zIndex: 1001,
  },
  dimmedOverlayStyle: {
    position: "absolute" as const,
    inset: 0,
    backgroundColor: "#0026732E",
    zIndex: 1000,
    pointerEvents: "auto" as const,
    cursor: "pointer",
    borderRadius: "4px",
  },
  toolbarContainer: {
    position: "absolute" as const,
    top: "-35px",
    right: "0",
    zIndex: 1002,
    backgroundColor: "transparent",
  },
};

const PdfHighlightViewer: React.FC<{
  pageNumber: number;
  workspaceId: number;
}> = memo(({ pageNumber, workspaceId }) => {
  // State
  const [currentScale, setCurrentScale] = useState(1);
  const [highlightAreas, setHighlightAreas] = useState<
    PdfHighlightViewerProps[]
  >([]);
  const [hoveredHighlight, setHoveredHighlight] = useState<string | null>(null);
  const [pageDimensions, setPageDimensions] = useState<PageDimensions | null>(
    null,
  );
  const [lockedHighlight, setLockedHighlight] = useState<string | null>(null);
  const [isDimmed, setIsDimmed] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [pageLoadingProgress, setPageLoadingProgress] = useState(0);

  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Redux
  const dispatch: AppDispatch = useDispatch();
  const tableChunksData = useSelector(selectTableChunks);
  const graphChunksData = useSelector(selectGraphChunks);
  const { sections } = useSelector((state: RootState) => state.documents);
  const { activeDocument } = useSelector(
    (state: RootState) => state.projectDocuments,
  );

  // Memoized handlers
  const handleAddToWorkspace = useCallback(
    async (chunk: any) => {
      try {
        const sectionName = findSectionIndex(pageNumber, sections);
        const payload = {
          workspaceId: Number(workspaceId),
          elementType: chunk.type || "text",
          imageCaption:
            chunk.table_with_caption || chunk.figure_with_caption,
          content: chunk.description || null,
          pageNumber: pageNumber || 1,
          contentTitle: chunk.title || null,
          aiSummary: "",
          sectionName,
          htmlContent: chunk.table_html?.[0] || null,
        };

        await dispatch(addElement(payload));
      } catch (error) {
        console.error("Error adding element:", error);
      }
    },
    [dispatch, pageNumber, sections, workspaceId],
  );

  const handleAskAI = useCallback(
    (payload: any) => {
      const aiPayload = {
        ...payload,
        extractedData: payload.table_html || "",
        pageNumber,
        tableId: payload.table_id,
        content: payload.description || payload.content,
        imageSrc:
          payload.table_without_caption || payload.figure_without_caption,
      };
      dispatch(setSelectedData(aiPayload));
      dispatch(setIsOpen());
    },
    [dispatch, pageNumber],
  );

  const calculateOptimalScale = useCallback(
    (
      containerWidth: number,
      containerHeight: number,
      pageWidth: number,
      pageHeight: number,
    ): number => {
      const scaleForHeight = (containerHeight - 100) / pageHeight;
      const browserZoom =
        window.innerWidth / document.documentElement.clientWidth;
      return scaleForHeight * browserZoom;
    },
    [],
  );

  const handleResize = useCallback(
    debounce(() => {
      if (!containerRef.current || !pageDimensions) return;

      const { clientWidth, clientHeight } = containerRef.current;
      const newScale = calculateOptimalScale(
        clientWidth,
        clientHeight,
        pageDimensions.width,
        pageDimensions.height,
      );
      setCurrentScale(newScale);
    }, RESIZE_DEBOUNCE_TIME),
    [pageDimensions, calculateOptimalScale],
  );

  const adjustHighlightAreas = useCallback(
    (scale: number) => {
      if (!pageDimensions) return [];

      const transformCoordinates = ([
        xMin,
        yMin,
        xMax,
        yMax,
      ]: number[]): Coordinates => {
        const { height, width } = pageDimensions;
        const borderAdjustment = (BORDER_ADJUSTMENT / width) * 100;

        return {
          left: (xMin / width) * 100 - borderAdjustment,
          top: (yMin / height) * 100 - borderAdjustment,
          width: ((xMax - xMin) / width) * 100 + 2 * borderAdjustment,
          height: ((yMax - yMin) / height) * 100 + 2 * borderAdjustment,
        };
      };

      const createHighlights = (chunksData: any, prefix: string) => {
        if (!chunksData?.[activeDocument?.id]?.[pageNumber]) return [];

        return chunksData[activeDocument.id][pageNumber].map(
          (chunk: any, index: number) => ({
            ...chunk,
            docId: `${prefix}Highlight${index + 1}`,
            type:
              chunk?.type === "graph"
                ? "graph"
                : chunk?.type === "image"
                  ? "image"
                  : "table",
            pageIndex: 0,
            coordinates: chunk.coordinates
              ? Object.values(chunk.coordinates).map((value: any) =>
                  transformCoordinates(value),
                )
              : [],
          }),
        );
      };

      const tableHighlights = createHighlights(tableChunksData, "table");
      const graphHighlights = createHighlights(graphChunksData, "graph");

      return [...tableHighlights, ...graphHighlights].filter(
        (area: PdfHighlightViewerProps) => area.coordinates.length > 0,
      );
    },
    [
      activeDocument?.id,
      graphChunksData,
      pageNumber,
      pageDimensions,
      tableChunksData,
    ],
  );

  // Effects
  useEffect(() => {
    if (pageDimensions) {
      const adjustedHighlights = adjustHighlightAreas(currentScale);
      setHighlightAreas(adjustedHighlights);
    }
  }, [pageDimensions, currentScale, adjustHighlightAreas]);

  useEffect(() => {
    if (pageDimensions && containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const newScale = calculateOptimalScale(
        clientWidth,
        clientHeight,
        pageDimensions.width,
        pageDimensions.height,
      );
      setCurrentScale(newScale);
    }
  }, [pageDimensions, calculateOptimalScale]);

  useEffect(() => {
    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
  }, [pageDimensions, handleResize]);

  const handlePageRender = () => {
    // Simulate gradual loading progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setPageLoadingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsPageLoading(false);
        }, 300); // Smooth transition delay
      }
    }, 100);
  };

  const handleDocumentLoad = async ({ doc }: { doc: any }) => {
    try {
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const dimensions = {
        width: viewport.width,
        height: viewport.height,
      };

      setPageDimensions(dimensions);
      // dispatch(setPageDimensionState(dimensions));

      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const newScale = calculateOptimalScale(
          clientWidth,
          clientHeight,
          dimensions.width,
          dimensions.height,
        );
        setCurrentScale(newScale);
      }

      handlePageRender();
    } catch (error) {
      console.error("Error loading page:", error);
      setIsPageLoading(false);
    }
  };

  const removeRawFromUrl = useCallback(
    (url: string): string => {
      if (!activeDocument?.url) return url;
      const lastIndex = activeDocument.url.lastIndexOf("/RAW");
      return lastIndex !== -1
        ? activeDocument.url.substring(0, lastIndex)
        : url;
    },
    [activeDocument?.url],
  );

  // Plugin configuration
  const highlightPluginInstance = highlightPlugin({
    renderHighlights: (props: RenderHighlightsProps) => {
      const lockedArea = lockedHighlight
        ? highlightAreas.find((area) => area.docId === lockedHighlight)
            ?.coordinates[0]
        : null;
      return (
        <div style={styles.highlightWrapper}>
          {isDimmed && lockedArea && (
            <>
              <div
                onClick={() => {
                  setLockedHighlight(null);
                  setHoveredHighlight(null);
                  setIsDimmed(false);
                }}
                style={{
                  ...styles.dimmedOverlayStyle,
                  bottom: `${100 - lockedArea.top}%`,
                }}
              />
              <div
                onClick={() => {
                  setLockedHighlight(null);
                  setHoveredHighlight(null);
                  setIsDimmed(false);
                }}
                style={{
                  ...styles.dimmedOverlayStyle,
                  top: `${lockedArea.top}%`,
                  bottom: `${100 - (lockedArea.top + lockedArea.height)}%`,
                  right: `${100 - lockedArea.left}%`,
                }}
              />
              <div
                onClick={() => {
                  setLockedHighlight(null);
                  setHoveredHighlight(null);
                  setIsDimmed(false);
                }}
                style={{
                  ...styles.dimmedOverlayStyle,
                  top: `${lockedArea.top}%`,
                  bottom: `${100 - (lockedArea.top + lockedArea.height)}%`,
                  left: `${lockedArea.left + lockedArea.width}%`,
                }}
              />
              <div
                onClick={() => {
                  setLockedHighlight(null);
                  setHoveredHighlight(null);
                  setIsDimmed(false);
                }}
                style={{
                  ...styles.dimmedOverlayStyle,
                  top: `${lockedArea.top + lockedArea.height}%`,
                }}
              />
            </>
          )}

          {highlightAreas
            .filter(
              (area) =>
                area.pageIndex === props.pageIndex && area.type !== "image",
            )
            .map((area) => {
              const isLocked = lockedHighlight === area.docId;
              const isHovered = !isDimmed && hoveredHighlight === area.docId;
              const showHighlight = isLocked || isHovered;

              return (
                <div
                  key={area.docId}
                  onClick={() => {
                    setLockedHighlight(isLocked ? null : area.docId);
                    setHoveredHighlight(null);
                    setIsDimmed(!isLocked);
                  }}
                  onMouseEnter={() =>
                    !isDimmed && setHoveredHighlight(area.docId)
                  }
                  onMouseLeave={() => setHoveredHighlight(null)}
                  style={{
                    ...styles.highlightArea,
                    boxShadow: "0 2px 6px rgba(0, 76, 230, 0.3)",
                    ...props.getCssProperties(
                      {
                        ...area,
                        ...area.coordinates[0],
                      },
                      props.rotation,
                    ),
                    opacity: showHighlight ? 1 : 0,
                    pointerEvents: isDimmed && !isLocked ? "none" : "auto",
                    zIndex: isLocked ? 1002 : 1001,
                  }}
                >
                  {(isLocked || isHovered) && (
                    <div
                      style={{
                        ...styles.toolbarContainer,
                        transition: "opacity 0.2s ease-in-out",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ToolBar
                        context={{
                          contentToCopy: area?.type === "graph" ? area?.figure_without_caption : area?.table_html?.[0],
                          tableTitle: area?.title,
                          isTable: !area?.type || area?.type === "table",
                          isGraphChunk: area?.figure_with_caption ? true : area?.type === "graph",
                          isTextChunk: false,
                          isChart: false,
                          tableId: area?.table_id,
                          currentPage: pageNumber,
                          pageNumber: pageNumber,
                          pdfUrl: activeDocument?.url,
                          ImageUrl: area?.figure_with_caption
                        }}
                        isSearch={false}
                        onAddToWorkspace={() => handleAddToWorkspace(area)}
                        onAskAI={() => handleAskAI(area)}
                        features={{
                          showModifyButton: true,
                          showSimilarTables: area?.type !== "graph",
                          showActionButtons: true
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      );
    },
    trigger: Trigger.None,
  });

  return (
    <>
      <div className="w-full h-1 rounded-[10px] bg-[#004CE6] mb-1.5" />
      <div
        ref={containerRef}
        className="h-full w-full bg-white relative"
        // style={{
        //   border: '2px solid #EAF0FC',
        //   borderRadius: '8px',
        // }}
      >
        <div className="absolute inset-0 overflow-auto">
          <Worker workerUrl={WORKER_URL}>
            <Viewer
              fileUrl={`${removeRawFromUrl(activeDocument?.url)}/Processing/viewer/page_${pageNumber}.pdf`}
              plugins={[highlightPluginInstance]}
              defaultScale={SpecialZoomLevel.PageWidth}
              onDocumentLoad={handleDocumentLoad}
              renderLoader={() => <></>}
              theme="light"
            />
          </Worker>
        </div>
      </div>
    </>
  );
});

PdfHighlightViewer.displayName = "PdfHighlightViewer";

export default PdfHighlightViewer;
