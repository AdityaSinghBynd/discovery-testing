export interface BaseNode {
  node_id: string;
  score: number;
  text: string;
  title: string;
  page_num?: number;
  parent_chunk_page_num?: number;
  parent_chunk_content: string;
}

export interface TextNode extends BaseNode {
  parent_chunk_page_num: number;
  graph_without_caption: string;
  graph_with_caption: string;
}

export interface TableNode extends BaseNode {
  table_without_caption: any;
  graph_without_caption: string;
  graph_with_caption: string;
  page_num: number;
}

export interface GraphNode extends BaseNode {
  graph_without_caption: any;
  graph_with_caption: string;
  page_num: number;
}

export interface DocumentResponse {
  document_name?: string;
  text_nodes: Array<TextNode>;
  table_nodes: Array<TableNode>;
  graph_nodes: Array<GraphNode>;
}
