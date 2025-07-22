import { ReactNode } from "react";

export interface DocumentState {
  id: number;
  url: string;
  lockedPage: number;
  isActive: boolean;
}

export interface ProjectState {
  id?: string;
  isSearched: boolean;
  isSearchForAll: boolean;
  recentSearch: string[];
}

export interface PageDimensions {
  width: number;
  height: number;
}

export interface PanelLayout {
  leftPanel: number;
  rightPanel: number;
}

export type FilterContainerState = "closed" | "closing" | "opening" | "open";

export interface TableChunk {
  title: string;
  description: string;
  table_without_caption: string;
  table_html: string;
}

export interface PDFViewerWrapperProps {
  workspaceId: string;
}
