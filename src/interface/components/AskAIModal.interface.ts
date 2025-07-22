export interface TableChunk {
  table_html: string;
}

export interface AskAIModalProps {
  isOpen: boolean;
  tableChunk: TableChunk[];
  onClose: () => void;
  selectedContent: {
    imageSrc: any;
    generated_title: string;
    tableHead?: string;
    content: any;
    messages: string[];
    extractedData?: any;
    tableDescription?: string;
    isTableChunk?: boolean;
    type?: string;
    tableId?: string;
    pageNumber?: number;
  } | null;
}

export interface Message {
  text: string;
  isUser: boolean;
  chartType?: any;
  chartData?: any;
  loaded?: boolean;
}
