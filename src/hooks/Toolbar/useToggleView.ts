import { useState, useCallback, useEffect } from "react";

type TableData = {
  coordinates: object;
  currency: string;
  data_patterns: string;
  description: string;
  doc_intelligence_index: string;
  inside_text: string[];
  keywords: string[];
  new_y_max: number;
  new_y_min: number;
  related_content: string[];
  section_doc_intelligence_index: string;
  table_html: string[];
  table_id: string;
  table_with_caption: string;
  table_without_caption: string;
  time_period: string;
  title: string;
  unit: string;
};

type TableChunksData = {
  [pageNumber: number]: TableData[];
};

interface TableNode {
  node_id?: string;
  id?: string | number;
  text: string;
  page_num?: number;
  pageNumber?: number;
  title?: string;
  contentTitle?: string;
}

interface UseToggleViewProps {
  tableChunksData: TableChunksData;
  responses?: any[];
  elements?: any[];
  initialView?: "selectedImage" | "selectedScan";
}

interface UseToggleViewReturn {
  nodeViewStates: { [key: string]: boolean };
  nodeHtmlContent: { [key: string]: string };
  handleToggleView: (
    identifier: string | number,
    isTableActive: boolean,
    pageNum: number,
    title?: string,
  ) => void;
  getTableHtmlContent: (pageNumber: number, title: string) => string[] | null;
}

export const getTableHtmlByPageAndId = (
  data: TableChunksData,
  pageNumber: number,
  tableId: string,
): string[] | null => {
  const pageData = data?.[pageNumber];
  if (!pageData) return null;

  const table = pageData.find((table) => table.table_id === tableId);
  return table?.table_html || null;
};

export const getTableHtmlByPageAndTitle = (
  data: TableChunksData,
  pageNumber: number,
  title: string,
): string[] | null => {
  const pageData = data?.[pageNumber];
  if (!pageData) {
    return null;
  }

  const table = pageData.find((table) => table.title === title);
  if (table) {
    return table.table_html;
  }

  return null;
};

export const useToggleView = ({
  tableChunksData,
  responses = [],
  elements = [],
  initialView = "selectedImage",
}: UseToggleViewProps): UseToggleViewReturn => {
  const [nodeViewStates, setNodeViewStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [nodeHtmlContent, setNodeHtmlContent] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const newNodeViewStates: { [key: string]: boolean } = {};

    responses.forEach((documentResponse) => {
      documentResponse?.table_nodes?.forEach((node: TableNode) => {
        const identifier = node.node_id || node.id?.toString();
        if (identifier) {
          newNodeViewStates[identifier] = false;
        }
      });
    });

    elements.forEach((element: TableNode) => {
      if (element.id) {
        newNodeViewStates[element.id.toString()] = false;
      }
    });

    setNodeViewStates(newNodeViewStates);
  }, [JSON.stringify(responses), JSON.stringify(elements)]);

  const handleToggleView = useCallback(
    async (
      identifier: string | number,
      isTableActive: boolean,
      pageNum: number,
      title?: string,
    ) => {
      const nodeId = identifier.toString();
      setNodeViewStates((prev) => ({
        ...prev,
        [nodeId]: isTableActive,
      }));

      if (isTableActive) {
        let html: string[] | null = null;
        const tableId = nodeId.includes("_") ? nodeId.split("_").pop() : nodeId;

        // First try to get HTML from tableChunksData using title
        if (title && tableChunksData) {
          html = getTableHtmlByPageAndTitle(tableChunksData, pageNum, title);
        }

        // If not found by title and we have a tableId, try by ID
        if (!html && tableId && tableChunksData) {
          html = getTableHtmlByPageAndId(tableChunksData, pageNum, tableId);
        }

        // If we have table HTML content, update the state
        if (html && html.length > 0) {
          setNodeHtmlContent((prev) => ({
            ...prev,
            [nodeId]: html!.join(""),
          }));
        } else {
          console.warn("No HTML content found for table", { nodeId, pageNum, title });
        }
      }
    },
    [tableChunksData],
  );

  const getTableHtmlContent = useCallback(
    (pageNumber: number, title: string): string[] | null => {
      return getTableHtmlByPageAndTitle(tableChunksData, pageNumber, title);
    },
    [tableChunksData],
  );

  return {
    nodeViewStates,
    nodeHtmlContent,
    handleToggleView,
    getTableHtmlContent,
  };
};
