export interface ChunkData {
  type: "text" | "table" | "graph";
  data: any;
  y1: number;
  index: number;
}

export interface EnhancedTextChunkProps {
  sections: any[];
  onAddToWorkspace: (item: any) => void;
  onAskAI: (
    chunk: any,
    index: number,
    extractionData: any,
    imageSrc: string | null,
  ) => void;
  workspaceId: number;
  currentPage: number;
  layout: "Portrait" | "Landscape";
  documentId: number;
}
