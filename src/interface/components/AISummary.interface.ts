export interface Document {
  Heading: string;
  summary: string[];
  subheadings: {
    title: string;
    summary: string[];
  }[];
}

export interface ExpandedContent {
  tableHead: string;
  content: { heading: string; points: string[] }[];
}

export interface ModalState {
  isOpen: boolean;
  content: {
    generated_title: string;
    tableHead: string;
    imageSrc: any;
    content: { heading: string; points: string[] }[];
    messages: any[];
  } | null;
}
