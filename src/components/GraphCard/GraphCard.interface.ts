import { GraphNode, TableNode, TextNode } from "@/interface/components/search.interface";

interface BaseGraphCardData {
    title?: string;
}

export interface ChunksGraphCardData extends BaseGraphCardData {
    variant: 'chunks';
    title: string;
    description: string;
    figure_with_caption: string;
    figure_without_caption: string;
    type: "graph";
    pageNumber: number;
}

export interface SearchGraphCardData extends BaseGraphCardData {
    variant: 'search';
    title: string;
    text: string;
    page_num: number;
    node_id: string;
    pdfUrl: string;
    graph_with_caption?: string;
    graph_without_caption?: string;
    figure_with_caption?: string;
    figure_without_caption?: string;
    node: TextNode | TableNode | GraphNode;
}

export interface WorkspaceGraphCardData extends BaseGraphCardData {
    variant: 'workspace';
    contentTitle: string;
    content: string;
    pageNumber: number;
    sectionName: string;
    imageCaption: string;
    figure_without_caption: string;
    id: string;
    elementType: "graph";
}

export type GraphCardData = ChunksGraphCardData | SearchGraphCardData | WorkspaceGraphCardData;

interface BaseGraphCardProps {
    onAddToWorkspace: (chunk: any) => void;
    variant: 'chunks' | 'search' | 'workspace';
    index: number;
}

export interface ChunksGraphCardProps extends BaseGraphCardProps {
    variant: 'chunks';
    graphData: ChunksGraphCardData;
    pageNumber: number;
    messages: { [index: number]: string[] };
    onAskAI: (chunk: any, index: number, type: string | null) => void;
}

export interface SearchGraphCardProps extends BaseGraphCardProps {
    variant: 'search';
    graphData: SearchGraphCardData;
    onAskAI: (chunk: any, index: number, type: string | null) => void;
}

export interface WorkspaceGraphCardProps extends BaseGraphCardProps {
    variant: 'workspace';
    graphData: WorkspaceGraphCardData;
    onAskAI: (chunk: any, index: number, type: string | null) => void;
    onDelete?: (id: string) => void;
    onAddContent?: (content: string, imageCaption: string | undefined, contentTitle: string, pageNumber: number, tableHtml: string | null) => void;
}

export type GraphCardProps = ChunksGraphCardProps | SearchGraphCardProps | WorkspaceGraphCardProps;