export interface WorkspaceElementsProps {
  elements: any[];
  addContentToEditor: (
    content: string,
    imageCaption?: string,
    contentTitle?: string | null,
    pageNumber?: number,
    tableHtml?: string | null,
    elementType?: string,
  ) => void;
  onElementCountChange: (count: number) => void;
  onDeleteElement: (index: number) => void;
  onRestoreElement: any;
  workspaceId: number;
}
