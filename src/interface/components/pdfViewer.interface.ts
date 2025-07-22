export interface Coordinates {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PdfHighlightViewerProps {
  docId: string;
  pageIndex: number;
  coordinates: Coordinates[];
  content: string;
  table_html: string[];
  title: string;
  type: "table" | "graph" | "image";
  figure_without_caption?: string;
  figure_with_caption?: string;
  table_without_caption?: string;
  table_id?: string;
}

export interface PageDimensions {
  width: number;
  height: number;
}
