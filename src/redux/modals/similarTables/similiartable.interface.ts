// ==========================================
// SIMILAR TABLES API INTERFACES
// ==========================================

// Base table interface with common properties
export interface BaseTable {
  table_id: string;
  page_number: number;
  html: string;
  blob_url: string;
}

// Extended table data from API response
export interface SimilarTableData extends BaseTable {
  table_url: string;
  title: string;
  description: string;
  similarity: number;
  relevance_score: number;
  structure: string;
}

// ==========================================
// FETCH SIMILAR TABLES
// ==========================================

export interface FetchSimilarTablesPayload {
  sourceUrl: string;  // Changed from source_pdf to match usage
  tableId: string;    // Changed from table_id to match usage
  pageNumber: number; // Changed from page_number to match usage
  compatiorUrls: string[]; // Changed from competitor_pdf_urls to match usage
}

// Nested response structure: Company -> DocumentType -> Year -> Tables[]
export interface SimilarTablesResponse {
  [companyName: string]: {
    [documentType: string]: {
      [year: string]: SimilarTableData[];
    };
  };
}

// ==========================================
// COMBINED TABLES
// ==========================================

export interface CombinedTableItem {
  id: number;
  blobUrl: string;
  blob_url: string; // API uses snake_case
  documentType: string;
  document_type: string; // API uses snake_case
  pageNumber: number;
  page_number: number; // API uses snake_case
  tableId: string;
  table_id: string; // API uses snake_case
  year: number;
}

export interface CombinedTablesPayload {
  tables: CombinedTableItem[];
}

export interface MergedTable {
  html: string;
  currency: string | null;
  denomination: string | null;
}

export interface SourceTable extends BaseTable {
  // Inherits: table_id, page_number, html, blob_url
}

export interface CombinedTablesResponse {
  merged_table: MergedTable;
  source_tables: SourceTable[];
}

// ==========================================
// UI STATE INTERFACES
// ==========================================

// UI-specific processed table data (what the component actually uses)
export interface ProcessedTableData {
  title: string;
  table_html: string[];
  table_id: string | number;
  page_number: number;
  description?: string;
  table_without_caption?: string;
}

export interface SelectedTable {
  id: number;
  blobUrl: string;
  pageNumber: number;
  tableId: string | number;
  year: string;
  documentType: string;
  table_without_caption: string;
}

export interface SelectedDocument {
  id: number;
  url: string;
  year: string;
  documentType: string;
}

// ==========================================
// REDUX STATE INTERFACES
// ==========================================

export interface SimilarTablesAPIState {
  data: SimilarTablesResponse | null;
  loading: boolean;
  error: string | null;
}

export interface SimilarTablesModalState {
  isSimilarTablesOpen: boolean;
  primaryTableImage: string;
  selectedDocs: string[];
  similarTables: Record<string, SimilarTablesAPIState>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  tableId: string;
  currentPage: number;
  previewData: Record<string, any>;
}

// ==========================================
// UTILITY TYPES
// ==========================================

// For processing flattened table arrays
export type FlattenedSimilarTable = Omit<SimilarTableData, 'structure'> & {
  table_without_caption?: string;
};

// Generic API response wrapper
export interface APIResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Thunk payload types
export interface FetchSimilarTablesThunkPayload extends FetchSimilarTablesPayload {
  // Can extend with additional metadata if needed
}

export interface CombinedTablesThunkPayload extends CombinedTablesPayload {
  // Can extend with additional metadata if needed
} 
    