import type { OutputData } from "@editorjs/editorjs";

export interface DocumentEditorProps {
  onChange?: (data: OutputData) => void;
  onTitleChange?: (title: string) => void;
  initialData?: OutputData;
  documentTitle?: string;
  newContent?: {
    content: string;
    imageCaption?: string;
    contentTitle?: string | null;
    pageNumber?: number;
    tableHtml?: string | null;
    elementType?: string;
  };
}
