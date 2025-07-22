import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Minus, Tally1, ChevronRight, PanelRightClose, Loader2, AlertCircle } from "lucide-react";
import styles from "@/styles/SlugExtraction.module.scss";
import { useToastStore } from "@/store/useTostStore";
import { useRouter } from "next/router";

// Components
import AISummary from "@/components/AISummary";
import SearchQuery from "@/components/Search";
import { Progress } from "@/components/ui/progress";
import PdfHighlightViewer from "@/components/PdfViewer";
import DocumentNavigator from "@/components/DocumentNavigator";

// Redux
import { AppDispatch, RootState } from "@/store/store";
import { updateProject } from "@/redux/projectDocuments/projectDocumentsThunks";
import { usePageInteractions } from "@/hooks/PDFExplorer/usePDFViewer";
import DocumentActions from "@/components/DocumentActions";
import Financials from "@/components/Financials";
import { fetchProjectDocumentsByProjectId } from "@/redux/projectDocuments/projectDocumentsThunks";
import { updateActiveDocumentStatus } from "@/redux/projectDocuments/projectDocumentsSlice";
import { truncateText } from "@/utils/utils";

// Dynamic imports
const PageExplorer = dynamic(() => import("@/components/PageExplorer"), {
  ssr: false,
});
const Chunks = dynamic(() => import("@/components/Chunks/chunks"));

interface FinancialData {
  [key: string]: any; // or more specific type for your financial data
}

// Types
interface TableChunk {
  title: string;
  description: string;
  table_without_caption: string;
  table_html: string;
}

interface Layout {
  leftPanel: number;
  rightPanel: number;
}

interface VerticalLayout {
  topPanel: number;
  bottomPanel: number;
}

interface PDFViewerWrapperProps {
  workspaceId: number;
}

// Constants
const INITIAL_HORIZONTAL_LAYOUT: Layout = { leftPanel: 33, rightPanel: 67 };
const INITIAL_VERTICAL_LAYOUT: VerticalLayout = {
  topPanel: 54,
  bottomPanel: 46,
};
const ANIMATION_DURATION = 500;
const COLLAPSE_THRESHOLD = 2;
const MIN_PDF_VIEWER_HEIGHT = 30;

const BREAKPOINTS = {
  SM: 400,
  MD: 500,
  LG: 600,
  XL: 700,
} as const;

// Animation variants
const animations = {
  push: {
    initial: { x: "0%", width: "150%" },
    animate: { x: "-30%", width: "150%" },
    exit: { x: "-100%", width: "150%" },
  },
  aiSummary: {
    initial: { x: 0, opacity: 1 },
    animate: { x: "100%", opacity: 0.7 },
    exit: { x: 0, opacity: 1 },
  },
  searchQuery: {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
};

// Move CollapsedPanelIndicator outside the main component
interface CollapsedPanelIndicatorProps {
  isLeftPanelCollapsed: boolean;
  activeDocumentName: string | undefined;
  onExpand: () => void;
}

const CollapsedPanelIndicator = React.memo(function CollapsedPanelIndicator({
  isLeftPanelCollapsed,
  activeDocumentName,
  onExpand,
}: CollapsedPanelIndicatorProps) {
  if (!isLeftPanelCollapsed || !activeDocumentName) return null;

  const documentTitle = activeDocumentName
    ?.replace(/[^a-zA-Z0-9\s]/g, " ")
    .toUpperCase() || "DOCUMENT";

  return (
    <motion.div
      key="collapsed-indicator"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="absolute left-0 top-0 h-full z-50 flex items-center"
    >
      <div
        className="bg-white h-full w-10 border-r border-[#EAF0FC] shadow-custom-blue flex flex-col items-center justify-between py-2 cursor-pointer group rounded"
        onClick={onExpand}
      >
        <PanelRightClose className="h-5 w-5 text-[#4E5971] group-hover:text-[#004CE6] group-hover:bg-[#EAF0FC] transition-colors" />
        <div
          className="vertical-text font-medium text-[13px] text-[#4E5971] rotate-180 transition-colors truncate max-h-[300px]"
          style={{ writingMode: 'vertical-rl' }}
          title={documentTitle}
        >
          {documentTitle}
        </div>
        <PanelRightClose className="h-5 w-5 text-[#4E5971] group-hover:text-[#004CE6] group-hover:bg-[#EAF0FC] transition-colors" />
      </div>
    </motion.div>
  );
});

const PDFViewerWrapper: React.FC<PDFViewerWrapperProps> = ({ workspaceId }) => {
  // Refs
  const resizeDivRef = useRef<HTMLDivElement>(null);
  const panelGroupRef = useRef<any>(null);
  const router = useRouter();
  const { slug } = router.query;

  // Redux
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProject, selectedDocuments, activeDocument } = useSelector(
    (state: RootState) => state.projectDocuments,
  );
  const sections = useSelector((state: RootState) => state.documents.sections);
  const currentPageDimensions = useSelector(
    (state: RootState) => state.pageDimensions,
  );

  // State
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);
  const [hoverPageNumber, setHoverPageNumber] = useState<number>(0);
  const [mouseHover, setMouseHover] = useState(false);
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const [isWaitingToClose, setIsWaitingToClose] = useState(false);
  const [closeTimeoutId, setCloseTimeoutId] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);
  const [isFinancialOpen, setIsFinancialOpen] = useState(false);
  const [hasPageBeenHovered, setHasPageBeenHovered] = useState(false);
  const [isAskAIModalOpen, setIsAskAIModalOpen] = useState(false);
  const [selectedCardData, setSelectedCardData] = useState<any | null>(null);
  const [tableData, setTableData] = useState({});
  const [id, setId] = useState<number | null>(null);
  const [colSpan, setColSpan] = useState("grid-cols-8");
  const [layoutId, setLayoutId] = useState(0);
  const prevOperationsRef = useRef<any[]>([]);

  const [horizontalLayout, setHorizontalLayout] = useState<Layout>(
    INITIAL_HORIZONTAL_LAYOUT,
  );
  const [verticalLayout, setVerticalLayout] = useState<VerticalLayout>(
    INITIAL_VERTICAL_LAYOUT,
  );
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [pdfAspectRatio, setPdfAspectRatio] = useState<number | null>(null);
  const [reRenderCount, setReRenderCount] = useState(0);
  const prevLayoutRef = useRef(INITIAL_HORIZONTAL_LAYOUT);
  const prevVerticalLayoutRef = useRef(INITIAL_VERTICAL_LAYOUT);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState<boolean>(false);

  const { handlePageClick } = usePageInteractions(
    activeDocument,
    selectedProject,
  );

  const { financialData } = useSelector(
    (state: RootState) => state.financialStatements,
  ) as { financialData: FinancialData };

  const { operations } = useToastStore();

  const activeDocumentOperation = useMemo(() => {
    if (!activeDocument?.id) return null;

    return operations.find(op =>
      op.fileName === activeDocument.name &&
      (op.status === "processing" || op.status === "uploading")
    );
  }, [operations, activeDocument]);

  const activeDocumentFailed = useMemo(() => {
    if (!activeDocument?.id) return null;

    return operations.find(op =>
      op.fileName === activeDocument.name &&
      op.status === "error"
    );
  }, [operations, activeDocument]);

  const isActiveDocumentLoading = useMemo(() => {
    console.log("isActiveDocumentLoading", activeDocument);
    if (!activeDocument?.id) return false;

    if (activeDocument.status === 'completed') return false;
    
    // Don't show loading state if we're searching
    if (selectedProject?.isSearched && selectedProject?.recentSearch) return false;

    // Check for active processing operation
    const hasActiveOperation = !!activeDocumentOperation;

    // Check document status
    const isProcessing = activeDocument.status === 'loading' || activeDocument.status === 'processing';

    // If operation was just completed, stop showing loading
    const isOperationJustCompleted = operations.some(op =>
      op.fileName === activeDocument.name &&
      op.status === 'complete' &&
      prevOperationsRef.current.some(prevOp =>
        prevOp.id === op.id &&
        ['processing', 'uploading'].includes(prevOp.status)
      )
    );
    console.log("isOperationJustCompleted", prevOperationsRef.current);

    if (isOperationJustCompleted ) {
      console.log("isOperationJustCompleted", activeDocument);
      dispatch(updateActiveDocumentStatus({ status: "completed" }));
      return false;
    }

    return hasActiveOperation || isProcessing;
  }, [activeDocument, activeDocumentOperation, operations, dispatch, selectedProject?.isSearched, selectedProject?.recentSearch]);

  const currentFinancialData = useMemo(() => {
    return activeDocument.id ? financialData[activeDocument.id] : null;
  }, [activeDocument.id, financialData]);

  // Memoized values
  const isLandscape = useMemo(
    () => currentPageDimensions.width > currentPageDimensions.height,
    [currentPageDimensions],
  );

  const calculateColumnCount = useCallback(
    (width: number): string => {
      if (width < BREAKPOINTS.SM) return "grid-cols-4";
      if (width < BREAKPOINTS.MD) return "grid-cols-6";
      if (width < BREAKPOINTS.LG) return "grid-cols-8";
      return "grid-cols-8";
    },
    [selectedProject.isSearchForAll],
  );

  // Event Handlers
  const handleNodeClick = useCallback(
    async (pageNumber: number, index: number) => {
      handlePageClick(pageNumber);
      await dispatch(updateProject({ payload: { isSearched: false } }));
      setHoverPageNumber(pageNumber);
    },
    [dispatch, handlePageClick],
  );

  const handleMouseHover = useCallback(
    (pageNumber: number | null) => {
      if (pageNumber === null) {
        if (hasPageBeenHovered && !isWaitingToClose) {
          setIsWaitingToClose(true);
          setTimeout(() => {
            setHoverPageNumber(0);
            setAnimationInProgress(false);
            setHasPageBeenHovered(false);
            setIsWaitingToClose(false);
          }, ANIMATION_DURATION);
        }
      } else {
        setHasPageBeenHovered(true);
        setAnimationInProgress(true);
        setHoverPageNumber(pageNumber);

        if (isWaitingToClose) {
          setIsWaitingToClose(false);
          if (closeTimeoutId) clearTimeout(closeTimeoutId);
        }
      }
    },
    [hasPageBeenHovered, isWaitingToClose, closeTimeoutId],
  );

  const handleHoverChange = (pageNumber: number) => {
    setHoverPageNumber(pageNumber);
  };

  const handleDimmedContainerClick = () => {
    setMouseHover(true);
    setHoverPageNumber(activeDocument.lockedPage);
    setIsWaitingToClose(true);

    if (closeTimeoutId) {
      clearTimeout(closeTimeoutId);
    }

    const timeoutId = setTimeout(() => {
      if (isWaitingToClose) {
        setIsWaitingToClose(false);
      }
    }, 500);

    setCloseTimeoutId(timeoutId);
  };

  const handleAskAI = useCallback((chunk: any) => {
    setSelectedCardData(chunk);
    setIsAskAIModalOpen(true);
  }, []);

  const handleHorizontalResize = useCallback((sizes: number[]) => {
    const isCollapsed = sizes[0] < COLLAPSE_THRESHOLD;
    setIsLeftPanelCollapsed(isCollapsed);

    if (!isCollapsed && sizes[0] > COLLAPSE_THRESHOLD) {
      prevLayoutRef.current = {
        leftPanel: sizes[0],
        rightPanel: sizes[1],
      };
    }

    setHorizontalLayout({
      leftPanel: sizes[0],
      rightPanel: sizes[1],
    });
  }, []);

  const handleVerticalResize = useCallback((sizes: number[]) => {
    if (sizes && sizes.length === 2) {
      setVerticalLayout({
        topPanel: sizes[0],
        bottomPanel: sizes[1],
      });
      prevVerticalLayoutRef.current = {
        topPanel: sizes[0],
        bottomPanel: sizes[1],
      };
    }
  }, []);

  // Effects

  useEffect(() => {
    const handleScroll = () => setMouseHover(false);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setDocumentUrls(selectedDocuments.map((doc) => doc.url));
  }, [selectedDocuments]);

  useEffect(() => {
    if (!activeDocument) {
      return;
    }
    if (activeDocument.id) {
      setId(activeDocument.id);
    }

    const lockedPage = activeDocument.lockedPage ?? -1;
    setHoverPageNumber(lockedPage === -1 ? 0 : lockedPage);
  }, [activeDocument]);

  useEffect(() => {
    const container = resizeDivRef.current;
    if (!container) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      const newWidth = entries[0].contentRect.width;
      setContainerWidth(newWidth);
      setColSpan(calculateColumnCount(newWidth));
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [calculateColumnCount]);


  useEffect(() => {
    if (!activeDocument?.id || !slug) return;

    const isProcessing = ['loading', 'processing'].includes(activeDocument.status);

    if (isProcessing && !activeDocumentOperation && activeDocument.name) {
      const operationId = `progress_${activeDocument.id}`;

      if (!operations.some(op => op.id === operationId)) {
        const { addOperation } = useToastStore.getState();
        addOperation({
          id: operationId,
          fileName: activeDocument.name,
          status: "processing",
          progress: 30,
          type: "process",
        });
      }
    }

    // Handle operation completion
    const unsubscribe = useToastStore.subscribe((state) => {
      const completedOp = state.operations.find(op =>
        op.status === 'complete' &&
        op.fileName === activeDocument.name
      );

      if (completedOp) {
        dispatch(updateActiveDocumentStatus({ status: 'completed' }));
        dispatch(fetchProjectDocumentsByProjectId(slug as string));
      }
    });

    return () => unsubscribe();
  }, [activeDocument?.id, activeDocument?.name, activeDocument?.status, slug, activeDocumentOperation, operations, dispatch]);


  // 1. ref for the *vertical* PanelGroup
const innerGroupRef = useRef<any | null>(null);

// 2. drive layout directly from the page dimensions
useLayoutEffect(() => {
  if (!currentPageDimensions.width || !currentPageDimensions.height) return;

  const aspect = currentPageDimensions.height / currentPageDimensions.width;
  let top = 0;
  let bottom = 0;
  if(aspect > 1){
    top  = 76.2 / aspect;        // same numbers you used before
    bottom = 100 - top;
  }
  else{
    const K = 104.53;
    const P = 0.773;
  
    top    = K * Math.pow(aspect, P);
    top    = Math.max(MIN_PDF_VIEWER_HEIGHT, Math.min(80, top));
    bottom = 100 - top;
  }

  // Update React state *and* the panel group itself
  setVerticalLayout({ topPanel: top, bottomPanel: bottom });
  innerGroupRef.current?.setLayout([top, bottom]);   // <- key line
}, [currentPageDimensions]);

  const rightPanel = useCallback(() => {
    if (!selectedProject || !activeDocument) {
      return null;
    }
    if (hoverPageNumber) {
      return (
        <motion.div
          key="pdf-content"
          initial={{ x: "-100%", width: "100%" }}
          animate={{ x: "0%", width: "100%" }}
          exit={{ x: "-100%", width: "100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 z-10 w-full h-full"
        >
          <div className="h-full w-full">
            <PanelGroup
                ref={innerGroupRef}   
              direction={isLandscape ? "vertical" : "horizontal"}
              onLayout={handleVerticalResize}
              className="w-full h-full"
            >
              <Panel
                defaultSize={verticalLayout.topPanel}
                minSize={MIN_PDF_VIEWER_HEIGHT}
                className="w-full"
              >
                <div className="h-full w-full relative pdf-viewer-container overflow-hidden ml-2">
                  <PdfHighlightViewer
                    pageNumber={hoverPageNumber}
                    workspaceId={workspaceId}
                  />
                </div>
              </Panel>
              <div className="relative flex items-center justify-center">
                <PanelResizeHandle className="absolute h-full flex items-center justify-center">
                  <div
                    className="flex items-center justify-center cursor-pointer pl-4 group relative"
                    title="Drag to resize or double-click to collapse"
                  >
                    {isLandscape ? (
                      <Minus className="h-6 w-6" />
                    ) : (
                      <Tally1 className="h-6 w-6" />
                    )}
                  </div>
                </PanelResizeHandle>
              </div>
              <Panel
                defaultSize={verticalLayout.bottomPanel}
                minSize={20}
                className="w-full"
              >
                <div className="w-full pb-[150px]">
                  <Chunks
                    documentId={id ? id : activeDocument?.id}
                    sections={sections}
                    onAddToWorkspace={() => { }}
                    onAskAI={handleAskAI}
                    workspaceId={workspaceId}
                    currentPage={hoverPageNumber}
                    layout={isLandscape ? "Landscape" : "Portrait"}
                  />
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </motion.div>
      );
    }

    // Financial data panel
    const documentId = activeDocument?.id?.toString();
    const hasFinancialData =
      documentId &&
      financialData[documentId] &&
      financialData[documentId]?.loading === false &&
      financialData[documentId]?.data;

    if (
      !selectedProject.isSearched &&
      documentId &&
      hasFinancialData &&
      isFinancialOpen &&
      currentFinancialData?.data?.status !== "error"
    ) {
      return (
        <motion.div
          key="financial-content"
          variants={animations.searchQuery}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 z-0 w-full"
        >
          <Financials
            documentId={documentId}
            onClose={() => setIsFinancialOpen(false)}
          />
        </motion.div>
      );
    }

    // AI Summary panel
    if (!selectedProject.isSearched && isAISummaryOpen && documentId) {
      return (
        <motion.div
          key="ai-summary-content"
          variants={animations.searchQuery}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 z-0 w-full"
        >
          <AISummary
            documentId={documentId}
            onClose={() => setIsAISummaryOpen(false)}
          />
        </motion.div>
      );
    }

    // Search results panel
    const hasSearchResults =
      selectedProject.isSearched && selectedProject.recentSearch?.length > 0;
    if (hasSearchResults) {
      return (
        <motion.div
          key="search-content"
          variants={animations.searchQuery}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={`absolute inset-0 z-0 w-full ${documentUrls.length > 1 ? "overflow-x-auto" : "flex-wrap"}`}
        >
          <SearchQuery onNodeClick={handleNodeClick} />
        </motion.div>
      );
    }

    // Default view
    return (
      <motion.div
        key="ai-summary"
        variants={animations.aiSummary}
        initial="initial"
        animate={hoverPageNumber ? "animate" : "initial"}
        exit="initial"
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="absolute inset-0 z-0 w-full h-full"
      >
        <div className={`w-full h-screen overflow-hidden ${isLeftPanelCollapsed ? "ml-2" : ""}`}>
          <DocumentActions
            onAISummaryOpen={() => {
              setIsAISummaryOpen(true);
              setIsFinancialOpen(false);
            }}
            onFinancialOpen={() => {
              setIsAISummaryOpen(false);
              setIsFinancialOpen(true);
            }}
          />
        </div>
      </motion.div>
    );
  }, [
    hoverPageNumber,
    documentUrls,
    isLandscape,
    handleVerticalResize,
    activeDocument.id,
    selectedProject?.isSearched,
    selectedProject?.isSearchForAll,
    financialData,
    handleNodeClick,
    isFinancialOpen,
    isAISummaryOpen,
  ]);

  const handleExpand = useCallback(() => {
    setHorizontalLayout(INITIAL_HORIZONTAL_LAYOUT);
    setIsLeftPanelCollapsed(false);
    if (panelGroupRef.current) {
      panelGroupRef.current.setLayout([INITIAL_HORIZONTAL_LAYOUT.leftPanel, INITIAL_HORIZONTAL_LAYOUT.rightPanel]);
    }
  }, []);

  const handleCollapsePanel = useCallback(() => {
    setIsLeftPanelCollapsed(true);
    if (panelGroupRef.current) {
      panelGroupRef.current.setLayout([1, 99]);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-screen overflow-hidden gap-2 bg-[#f7f9fe]">
      <div className="w-full flex items-start px-2 z-50">
        <DocumentNavigator />
      </div>

      <AnimatePresence mode="wait">
        {isActiveDocumentLoading && (
          <motion.div
            key={`loading-${activeDocument?.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white opacity-510 p-6 text-center w-screen h-screen flex flex-col items-center justify-center"
          >
            <p className="text-[64px] leading-none font-medium text-[#001742] mb-2">
              Processing "{truncateText(activeDocument?.name, 52)}"
            </p>
            <p className="text-[#4e5971]">
              Structuring content and extracting relevant tables and charts.
            </p>
            {activeDocumentOperation && (
              <div className="mt-4 w-96">
                <Progress value={activeDocumentOperation.progress} className="h-2" />
                <p className="text-sm text-[#4e5971] mt-2 text-center">
                  {Math.round(activeDocumentOperation.progress)}% complete
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeDocumentFailed && !isActiveDocumentLoading && (
          <motion.div
            key={`error-${activeDocument?.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white opacity-510 p-6 text-center w-screen h-screen flex flex-col items-center justify-center"
          >
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Document processing failed
            </h3>
            <p className="text-gray-600">
              There was an error processing{" "}
              <span className="font-semibold text-red-500">{activeDocument?.name}</span>.
              <br />Please try again or contact support.
            </p>
            {activeDocumentFailed.error && (
              <p className="text-sm text-red-500 mt-2 max-w-md">
                Error: {activeDocumentFailed.error}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!isActiveDocumentLoading && !activeDocumentFailed && selectedProject?.isSearchForAll &&
        selectedProject?.isSearched &&
        selectedProject?.recentSearch?.length > 0 ? (
        <div className="flex-1 w-screen px-2">
          <SearchQuery onNodeClick={handleNodeClick} />
        </div>
      ) : (
        <div className="flex-1 w-screen flex px-2 space-x-2 relative">
          <AnimatePresence mode="wait">
            {isLeftPanelCollapsed && (
              <CollapsedPanelIndicator
                isLeftPanelCollapsed={isLeftPanelCollapsed}
                activeDocumentName={activeDocument?.name}
                onExpand={handleExpand}
              />
            )}
          </AnimatePresence>
          <PanelGroup
            ref={panelGroupRef}
            direction="horizontal"
            onLayout={handleHorizontalResize}
            className="w-full h-full flex"
          >
            {/* Left Panel */}
            <>
              <Panel
                defaultSize={horizontalLayout.leftPanel}
                minSize={1}
                maxSize={50}
                className="flex"
              >
                <div
                  ref={resizeDivRef}
                  className={`h-screen overflow-hidden flex-1 px-0 pt-1 bg-white rounded-t-[9px] ${activeDocument.lockedPage > 0 ? styles.dimmedContainer : ""
                    }`}
                  onClick={
                    activeDocument.lockedPage > 0
                      ? (e) => {
                        e.stopPropagation();
                        handleDimmedContainerClick();
                      }
                      : undefined
                  }
                >
                  <div className="h-full scrollbar-hide overflow-y-auto">
                    <PageExplorer
                      colSpan={colSpan}
                      id={String(id)}
                      handleMouseHover={handleMouseHover}
                      handleHoverChange={handleHoverChange}
                      mouseHover={mouseHover}
                      hoverPageNumber={hoverPageNumber}
                      onCollapsePanel={handleCollapsePanel}
                    />
                  </div>
                </div>
              </Panel>
              <div className="relative flex items-center justify-center">
                <PanelResizeHandle className="absolute h-full w-1 flex items-center justify-center">
                  <div className="flex items-center justify-center cursor-pointer pl-4 relative">
                    <Tally1 className="h-6 w-6" />
                  </div>
                </PanelResizeHandle>
              </div>
            </>
            {/* Right Panel */}
            <Panel
              defaultSize={horizontalLayout.rightPanel}
              className="flex relative"
            >
              <AnimatePresence mode="wait">{rightPanel()}</AnimatePresence>
            </Panel>
          </PanelGroup>
        </div>
      )}
    </div>
  );
};

export default React.memo(PDFViewerWrapper);

