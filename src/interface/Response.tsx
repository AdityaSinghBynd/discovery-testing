export interface UserData {
  id: number;
  username: string;
  email: string;
}

export interface FileUploadResponse {
  code: number;
  result: object;
  statusCode: number;
}

interface TableNode {
  text: string;
  score: number;
  title: string;
  node_id: string;
}

interface TextNode {
  text: string;
  score: number;
  title: string;
  node_id: string;
}

export interface RootObject {
  table_nodes: TableNode[];
  text_nodes: TextNode[];
}

export interface UserUploadData {
  userId: string | null;
  firstName: string;
  lastName: string;
}

export interface SearchResponse {
  table_nodes: Array<{
    node_id: string;
    score: number;
    text: string;
    title: string;
    table_without_caption: any;
    page_num: number;
  }>;
  text_nodes: Array<{
    node_id: string;
    score: number;
    text: string;
    title: string;
    parent_chunk_page_num: number;
    parent_chunk_content: string;
  }>;
  graph_nodes: Array<{
    node_id: string;
    score: number;
    text: string;
    title: string;
    graph_without_caption: any;
    page_num: number;
  }>;
}
