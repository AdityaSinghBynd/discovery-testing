export interface ToolbarContext {
  contentToCopy?: string;
  tableTitle?: string;
  isTable?: boolean;
  isChart?: boolean;
  isGraphChunk?: boolean;
  isTextChunk?: boolean;
  tableId?: string;
  currentPage?: number;
  pageNumber?: number | string;
  pdfUrl?: string;
  ImageUrl?: string;
  isWorkspace?: boolean;
  isSearch?: boolean;
}

export interface ToolbarBaseProps {
  context?: ToolbarContext;
  className?: string;
}

export interface ActionButtonsProps {
  onCopy?: () => void;
  onDownload?: () => void;
  onAddToWorkspace?: () => void;
  isSearch?: boolean;
  isCopying?: boolean;
  isWorkspace?: boolean;
}

export interface ViewToggleProps {
  onToggleView?: (isTableActive: boolean) => void;
  initialViewState?: boolean;
  nodeViewStates?: { [key: string]: boolean };
}

export interface ModifyButtonProps {
  onAskAI?: () => void;
  disabled?: boolean;
}

export interface SimilarTablesProps {
  onShowSimilarTables?: () => void;
}

export interface ToolbarProps extends ToolbarBaseProps, 
  Partial<ActionButtonsProps>,
  Partial<ViewToggleProps>,
  Partial<ModifyButtonProps>,
  Partial<SimilarTablesProps> {
  features?: {
    showViewToggle?: boolean;
    showModifyButton?: boolean;
    showSimilarTables?: boolean;
    showActionButtons?: boolean;
  };
}
