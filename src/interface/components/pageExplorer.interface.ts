// types.ts
import { Dispatch } from "redux";

export interface Section {
  index: string;
  startPage: number;
  endPage: number;
  subheadings?: Subheading[];
}

export interface Subheading {
  title: string;
  startPage: number;
  endPage: number;
}

export interface PDFViewerProps {
  colSpan: string;
  id: string;
  currentFileName?: string;
  handleMouseHover: (newDocumentURL: any) => void;
  mouseHover: boolean;
  hoverPageNumber: number;
  handleHoverChange: (pageNumber: number) => void;
  onCollapsePanel?: () => void;
}

export interface PageProps {
  pageNumber: number;
  isPinned: boolean;
  isSelected: boolean;
  isHovered: boolean;
  pageWidth: number;
  onLoadSuccess: () => void;
  handlePageClick: (pageNumber: number) => void;
  lockedPage: number;
  subtitle?: boolean;
}

export interface SectionProps {
  section: Section;
  index: number;
  expandedSections: number | null;
  hoveredSectionIndex: number | null;
  activeSectionIndex: number | null;
  initialPagesToShow: number;
  lockedPage: number;
  handleSectionHoverEnter: (
    index: number,
    setActiveSectionIndex: (index: number | null) => void,
  ) => void;
  handleSectionMouseLeave: (index: number) => void;
  toggleSection: (index: number) => void;
  handleSectionClick: (index: number) => void;
  hiddenSections: string[];
}
