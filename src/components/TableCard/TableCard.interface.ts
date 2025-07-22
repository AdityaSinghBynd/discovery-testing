import { GraphNode, TableNode, TextNode } from "@/interface/components/search.interface";

interface BaseGraphCardData {
    title?: string;
}

export interface ChunksTableCardData extends BaseGraphCardData {
    variant: 'chunks';
    title: string;
    description: string;
    table_with_caption: string;
    table_without_caption: string;
    type: "table";
    table_html: string[];
}

export interface SearchTableCardData extends BaseGraphCardData {
    variant: 'search';
    title: string;
    text: string;
    page_num: number;
    pageNumber: number;
    node_id: string;
    pdfUrl: string;
    table_with_caption: string;
    table_without_caption: string;
    table_html?: string | string[];
    node: TextNode | TableNode | GraphNode;
}

export interface WorkspaceTableCardData extends BaseGraphCardData {
    variant: 'workspace';
    contentTitle: string;
    content: string;
    pageNumber: number;
    sectionName: string;
    imageCaption: string;
    parent_chunk_page_num: number;
    id: string;
    page_num: number;
    elementType: "table";
    table_html?: any;
}

export type TableCardData = ChunksTableCardData | SearchTableCardData | WorkspaceTableCardData;

export interface BaseGraphCardProps {
    onAddToWorkspace: (chunk: any) => void;
    variant: 'chunks' | 'search' | 'workspace';
    index: number;
    onAskAI?: (chunk: any, index: number, type: string | null) => void;
}

export interface ChunksTableCardProps extends BaseGraphCardProps {
    variant: 'chunks';
    tableData: ChunksTableCardData;
    messages: { [index: number]: string[] };
    onAskAI: (chunk: any, index: number, type: string | null) => void;
}

export interface SearchTableCardProps extends BaseGraphCardProps {
    variant: 'search';
    tableData: SearchTableCardData;
    nodeViewStates?: { [key: string]: boolean };
    nodeHtmlContent?: { [key: string]: string };
    onToggleView?: (isExpanded: boolean) => void;
    features?: {
        showViewToggle?: boolean;
        showModifyButton?: boolean;
        showActionButtons?: boolean;
        showSimilarTables?: boolean;
    };
}

export interface WorkspaceTableCardProps extends BaseGraphCardProps {
    variant: 'workspace';
    tableData: WorkspaceTableCardData;
    onDelete?: (id: string) => void;
    onAddContent?: (content: string, imageCaption: string | undefined, contentTitle: string, pageNumber: number, tableHtml: string | null) => void;
    features?: {
        showViewToggle?: boolean;
        showModifyButton?: boolean;
        showActionButtons?: boolean;
        showSimilarTables?: boolean;
    };
}

export type TableCardProps = ChunksTableCardProps | SearchTableCardProps | WorkspaceTableCardProps; 