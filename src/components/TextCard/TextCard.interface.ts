import { GraphNode, TableNode, TextNode } from "@/interface/components/search.interface";

interface BaseTextCardData {
    title?: string;
}

export interface ChunksTextCardData extends BaseTextCardData {
    variant: 'chunks';
    generated_title: string;
    original_title: string;
    content: string;
    section_id: string;
    aiSummary: string;
    contentTitle: string;
}

export interface SearchTextCardData extends BaseTextCardData {
    variant: 'search';
    title: string;
    text: string;
    pageNumber: number;
    parent_chunk_page_num: number;
    parent_chunk_content: string;
    node_id: string;
    node: TextNode | TableNode | GraphNode;
}

export interface WorkspaceTextCardData extends BaseTextCardData {
    variant: 'workspace';
    contentTitle: string;
    content: string;
    pageNumber: number;
    sectionName: string;
    id: string;
    elementType: "text";
}

export type TextCardData = ChunksTextCardData | SearchTextCardData | WorkspaceTextCardData;

interface BaseTextCardProps {
    onAddToWorkspace: (chunk: any) => void;
    variant: 'chunks' | 'search' | 'workspace';
    index: number;
}

export interface ChunksTextCardProps extends BaseTextCardProps {
    variant: 'chunks';
    textData: ChunksTextCardData;
    messages: { [index: number]: string[] };
    onAskAI: (chunk: any, index: number, type: string | null) => void;
}

export interface SearchTextCardProps extends BaseTextCardProps {
    variant: 'search';
    textData: SearchTextCardData;
    onAskAI: (chunk: any, index: number, type: string | null) => void;
}

export interface WorkspaceTextCardProps extends BaseTextCardProps {
    variant: 'workspace';
    textData: WorkspaceTextCardData;
    onAskAI?: (chunk: any, index: number, type: string | null) => void;
    onDelete?: (id: string) => void;
    onAddContent?: (content: string, imageCaption: string | undefined, contentTitle: string, pageNumber: number, tableHtml: string | null) => void;
}

export type TextCardProps = ChunksTextCardProps | SearchTextCardProps | WorkspaceTextCardProps;