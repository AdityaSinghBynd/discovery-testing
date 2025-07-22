import { memo, useState, useCallback, useEffect } from "react";
import styles from "@/styles/toolBar.module.scss";
import { ViewToggle } from "./ViewToggle";
import { ActionButtons } from "./ActionButtons";
import { useClipboard } from "@/hooks/Toolbar/useClipboard";
import { useExcelDownload } from "@/hooks/Toolbar/useExcelDownload";
import { useGraphDownload } from "@/hooks/Toolbar/useGraphDownload";
import { ToolbarProps, ToolbarContext } from "@/interface/components/toolbar.interface";
import { ModifyButton } from "./Modify";
import { SimiliarTables } from "@/components/Modals/SimiliarTables";
import Image from "next/image";
import similiarTableSVGIcon from "../../../public/images/similiarTableSVGIcon.svg";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentPage, setIsSimilarTablesOpen, setTableId } from "@/redux/modals/similarTables/similarTablesSlice";
import { getSession } from "next-auth/react";
import { BASE_URL } from "@/constant/constant";
import axios from "axios";
import { setCompanyDocuments } from "@/redux/document/documentSlice";
import ToolbarErrorBoundary from './ErrorBoundary';

const Separator = () => <div className="h-5 w-[1.5px] rounded-full bg-[#eaf0fc]" />;

const safeContext = <T extends keyof ToolbarContext>(
  context: ToolbarContext | undefined, 
  key: T
): ToolbarContext[T] | undefined => {
  return context?.[key];
};

const SimilarTablesButton = ({ onClick }: { onClick: () => void }) => (
  <div 
    className="flex items-center gap-1 justify-start cursor-pointer hover:bg-[#f7f9fe] rounded p-[2px]" 
    onClick={onClick}
  >
    <label className="cursor-pointer">
      <Image src={similiarTableSVGIcon} alt="table" width={20} height={20}/>
    </label>
    <p className="text-[14px] text-[#4E5971]">Similar Tables</p>
  </div>
);

const Toolbar: React.FC<ToolbarProps> = memo(({
  context = {},
  className,
  // Action buttons props
  onAddToWorkspace,
  onCopy,
  onDownload,
  isSearch = false,
  // View toggle props
  onToggleView,
  initialViewState,
  nodeViewStates = {},
  // Modify button props
  onAskAI,
  // Similar tables props
  onShowSimilarTables,
  // Feature flags
  features = {
    showViewToggle: false,
    showModifyButton: false,
    showSimilarTables: false,
    showActionButtons: true,
  },
  isWorkspace,
}) => {
  const dispatch = useDispatch();
  const isModalOpen = useSelector((state: any) => state.similarTables.isOpen);
  const activeDocument = useSelector((state: any) => state.projectDocuments.activeDocument);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedButton, setSelectedButton] = useState<"selectedImage" | "selectedScan">(() => {
    const tableId = safeContext(context, 'tableId');
    if (tableId && nodeViewStates && nodeViewStates[tableId] !== undefined) {
      return nodeViewStates[tableId] ? "selectedScan" : "selectedImage";
    }
    return initialViewState ? "selectedScan" : "selectedImage";
  });

  const { isCopied, isCopying, copyToClipboard } = useClipboard(Boolean(safeContext(context, 'isTable')));
  const { downloadExcel } = useExcelDownload();
  const { downloadGraph } = useGraphDownload();

  useEffect(() => {
    const tableId = safeContext(context, 'tableId');
    if (tableId && nodeViewStates && nodeViewStates[tableId] !== undefined) {
      setSelectedButton(nodeViewStates[tableId] ? "selectedScan" : "selectedImage");
    }
  }, [nodeViewStates, context]);

  const handleToggle = useCallback(
    (type: "selectedImage" | "selectedScan") => {
      setSelectedButton(type);
      onToggleView?.(type === "selectedScan");
    },
    [onToggleView]
  );

  const handleSimilarTable = useCallback(async () => {
    dispatch(setIsSimilarTablesOpen(true));
    
    const tableId = safeContext(context, 'tableId');
    const currentPage = safeContext(context, 'currentPage');
    
    if (tableId) dispatch(setTableId(tableId));
    if (currentPage) dispatch(setCurrentPage(currentPage));
    
    try {
      const session = await getSession();
      const response = await axios.post(
        `${BASE_URL}/documents/company_name`,
        { companyName: activeDocument?.companyName },
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      if (response.status === 201) {
        dispatch(
          setCompanyDocuments({
            companyName: activeDocument?.companyName,
            documents: response.data,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }, [dispatch, context, activeDocument?.companyName]);

  const handleAddToWorkspace = useCallback(() => {
    if (onAddToWorkspace) {
      onAddToWorkspace();
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  }, [onAddToWorkspace]);

  const handleCopy = useCallback(() => {
    const contentToCopy = safeContext(context, 'contentToCopy');
    const tableTitle = safeContext(context, 'tableTitle');
    const isGraphChunk = safeContext(context, 'isGraphChunk');
    
    if (contentToCopy) {
      if (onCopy) {
        onCopy();
      } else if (isGraphChunk) {
        copyToClipboard(tableTitle || 'Graph', contentToCopy);
      } else if (tableTitle) {
        copyToClipboard(tableTitle, contentToCopy);
      }
    }
  }, [context, copyToClipboard, onCopy]);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
      return;
    }
    
    const isGraphChunk = safeContext(context, 'isGraphChunk');
    const imageUrl = safeContext(context, 'ImageUrl');
    const pageNumber = safeContext(context, 'pageNumber');
    const pdfUrl = safeContext(context, 'pdfUrl');
    const contentToCopy = safeContext(context, 'contentToCopy');
    const tableTitle = safeContext(context, 'tableTitle');
    
    if (isGraphChunk && imageUrl && pageNumber && pdfUrl) {
      downloadGraph(imageUrl, pageNumber, pdfUrl);
    } else if (contentToCopy && tableTitle) {
      downloadExcel(contentToCopy, tableTitle);
    }
  }, [context, onDownload, downloadExcel, downloadGraph]);

  const hasViewToggle = features.showViewToggle && onToggleView;
  const hasModifyButton = features.showModifyButton && onAskAI;
  const hasSimilarTables = features.showSimilarTables;
  const hasActionButtons = features.showActionButtons;

  // Separators
  const separatorAfterViewToggle = hasViewToggle && (hasModifyButton || hasSimilarTables || hasActionButtons);
  const separatorAfterModifyButton = hasModifyButton && (hasSimilarTables || hasActionButtons);
  const separatorAfterSimilarTables = hasSimilarTables && hasActionButtons;

  return (
    <>
      <div
        className={`${styles.toolBarContainer} ${className || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {hasViewToggle && (
          <>
            <ViewToggle selectedButton={selectedButton} onToggle={handleToggle} />
            {separatorAfterViewToggle && <Separator />}
          </>
        )}

        {hasModifyButton && onAskAI && (
          <>
            <ModifyButton onClick={onAskAI} />
            {separatorAfterModifyButton && <Separator />}
          </>
        )}

        {hasSimilarTables && (
          <>
            <SimilarTablesButton 
              onClick={onShowSimilarTables || handleSimilarTable} 
            />
            {separatorAfterSimilarTables && <Separator />}
          </>
        )}
        
        {hasActionButtons && (
          <ActionButtons
            isGraphChunk={Boolean(safeContext(context, 'isGraphChunk'))}
            isTextChunk={Boolean(safeContext(context, 'isTextChunk'))}
            isCopied={isCopied}
            isCopying={isCopying}
            isAdded={isAdded}
            onDownload={handleDownload}
            onCopy={handleCopy}
            onAdd={handleAddToWorkspace}
            isSearch={isSearch}
            isWorkspace={isWorkspace}
          />
        )}
      </div>

    </>
  );
});

const SafeToolbar: React.FC<ToolbarProps> = (props) => (
  <ToolbarErrorBoundary>
    <Toolbar {...props} />
  </ToolbarErrorBoundary>
);

export default SafeToolbar;