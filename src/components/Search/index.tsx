import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { X, List, Table2, ChartColumnIcon } from "lucide-react";
import { TabButton, TabContainer } from "./TabButton";
import { DocumentResponse } from "@/interface/components/search.interface";
import { addElement } from "@/redux/element/elementThunks";
import { selectTableChunks } from "@/redux/chunks/selector";
import { setIsOpen, setSelectedData } from "@/redux/askAi/askAiSlice";
import { updateDocument, updateProject } from "@/redux/projectDocuments/projectDocumentsThunks";
import { AppDispatch, RootState } from "@/store/store";
import { cleanFileName, sanitizedName } from "@/utils/utils";
import SearchSkeleton from "@/components/Skeleton/Search";
import noElements from "../../../public/images/workspaceElements.svg";
import { debounce } from "lodash";
import { fetchSections } from "@/redux/document/documentThunks";
import { fetchTableChunks } from "@/redux/chunks/chunksThunks";

import { track } from "@amplitude/analytics-browser";

import TableCard from '@/components/TableCard'
import GraphCard from '@/components/GraphCard'
import TextCard from '@/components/TextCard'
import {
  getTableHtmlByPageAndId,
} from "@/hooks/Toolbar/useToggleView";
import { setLocalPageLock } from "@/redux/projectDocuments/projectDocumentsSlice";
import { SearchTextCardData } from '@/components/TextCard/TextCard.interface';
import { SearchTableCardData } from '@/components/TableCard/TableCard.interface';
import { SearchGraphCardData } from '@/components/GraphCard/GraphCard.interface';

const ITEMS_PER_PAGE = 20;
const DEBOUNCE_DELAY = 300;

const SearchQuery: React.FC<{
  onNodeClick: (pageNumber: number, index: number) => void;
}> = ({ onNodeClick }) => {
  const [activeTab, setActiveTab] = useState<'keyTopics' | 'tables' | 'charts'>('keyTopics');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState(new Set<string>());
  const [counts, setCounts] = useState({ keyTopics: 0, tables: 0, charts: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const tableChunksData = useSelector(selectTableChunks);
  const { isLoading } = useSelector((state: RootState) => state.search);
  const { response, searchResults, searchResultsForAll } = useSelector(
    (state: RootState) => state.search,
  );
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProject } = useSelector(
    (state: RootState) => state.projectDocuments,
  );
  const { selectedDocuments, activeDocument } = useSelector(
    (state: RootState) => state.projectDocuments,
  );
  const sections = useSelector(
    (state: RootState) => state.documents.sections || {},
  );
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (selectedDocuments.length > 0) {
      selectedDocuments.forEach((document: any) => {
        if (!sections[document.id]) {
          dispatch(fetchSections(document.id));
        }
        if (!tableChunksData[document.id]) {
          dispatch(fetchTableChunks(document.id));
        }
      });
    }
  }, [selectedDocuments, sections, dispatch]);

  const responses = useMemo(() => {
    return selectedProject?.isSearchForAll && Array.isArray(response)
      ? response
      : response
        ? [response[0]]
        : [];
  }, [selectedProject?.isSearchForAll, response]);

  useEffect(() => {
    const calculateCounts = () => {
      if (responses.length > 0) {
        const totalCounts = responses.reduce(
          (acc, documentResponse) => ({
            keyTopics:
              acc.keyTopics + (documentResponse?.text_nodes?.length || 0),
            tables: acc.tables + (documentResponse?.table_nodes?.length || 0),
            charts: acc.charts + (documentResponse?.graph_nodes?.length || 0),
          }),
          { keyTopics: 0, tables: 0, charts: 0 },
        );
        setCounts((prevCounts) =>
          prevCounts.keyTopics !== totalCounts.keyTopics ||
          prevCounts.tables !== totalCounts.tables ||
          prevCounts.charts !== totalCounts.charts
            ? totalCounts
            : prevCounts,
        );
      }
    };

    calculateCounts();
  }, [responses]);

  const findSectionIndex = useCallback(
    (pageNum: number, index: number) => {
      for (const section of sections[selectedDocuments[index]?.id]) {
        if (pageNum >= section.startPage && pageNum <= section.endPage) {
          return section.index;
        }
      }
      return null;
    },
    [sections],
  );

  const handleAddToWorkspace = useCallback(
    async (node: any, index: number) => {
      if (isProcessing) return;

      try {
        setIsProcessing(true);
        const sectionName = findSectionIndex(
          node.page_num || node.parent_chunk_page_num,
          index,
        );
        const pageNum = node.page_num || node.parent_chunk_page_num || 1;
        const pageNumber =
          typeof pageNum === "string" ? parseInt(pageNum, 10) : pageNum;

        const htmlContent = node.table_without_caption
          ? getTableHtmlByPageAndId(
              tableChunksData[selectedDocuments[index]?.id],
              pageNumber,
              node.node_id.split("_").pop(),
            )?.join("") || null
          : null;

        const payload = {
          workspaceId: selectedProject?.workspace?.id,
          elementType: node.table_without_caption
            ? "table"
            : node.graph_without_caption || node.figure_without_caption
              ? "graph"
              : "text",
          imageCaption:
            node.table_without_caption || node.graph_without_caption || node.figure_without_caption || null,
          content: node.text || null,
          pageNumber,
          contentTitle: node.title || null,
          aiSummary: "",
          sectionName,
          htmlContent: htmlContent,
        };

        await dispatch(addElement(payload));
        setAddedItems((prev) => new Set(prev).add(node.node_id));
      } catch (error) {
        console.error("Error adding element:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [dispatch, selectedProject?.workspace?.id, findSectionIndex, isProcessing],
  );

  const handleAskAI = useCallback(
    debounce((data: any, nodeId: string, pageNumber: number) => {
      const tableId = nodeId.split("_").pop();
      const pageData = data?.[pageNumber];
      if (!pageData) return;

      const table = pageData.find((table: any) => table.table_id === tableId);
      if (table) {
        const aiPayload = {
          ...table,
          extractedData: table.table_html || "",
          pageNumber,
          tableId: table.table_id || 0,
          content: table.description || "",
          imageSrc: table.table_without_caption || "",
          type: "table",
        };
        dispatch(setSelectedData(aiPayload));
        dispatch(setIsOpen());
      }
    }, DEBOUNCE_DELAY),
    [dispatch],
  );

  const onActionClick = useCallback(() => {
    dispatch(
      updateProject({
        payload: {
          isSearchForAll: false,
          isSearched: false,
          recentSearch: "",
        },
      }),
    );
  }, [dispatch]);

  const handleToggleView = useCallback((nodeId: string, isExpanded: boolean) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: isExpanded
    }));
  }, []);

  const renderTabButtons = useCallback(
    () => (
      <TabContainer activeTab={activeTab}>
        <TabButton
          icon={List}
          label="Key Topics"
          count={counts.keyTopics}
          isActive={activeTab === "keyTopics"}
          onClick={() => setActiveTab("keyTopics")}
        />
        <TabButton
          icon={Table2}
          label="Tables"
          count={counts.tables}
          isActive={activeTab === "tables"}
          onClick={() => setActiveTab("tables")}
        />
        <TabButton
          icon={ChartColumnIcon}
          label="Charts"
          count={counts.charts}
          isActive={activeTab === "charts"}
          onClick={() => setActiveTab("charts")}
        />
      </TabContainer>
    ),
    [counts, activeTab],
  );

  const getDocumentIndex = useCallback(
    (name: string) => {
      return selectedDocuments.findIndex(
        (document: any) => document.name === name,
      );
    },
    [selectedDocuments],
  );

  const renderContent = useCallback(
    (documentResponse: DocumentResponse, name: string, index: number, documentId: string) => {
      const commonProps = {
        onAddToWorkspace: (node: any) => handleAddToWorkspace(node, index),
        onAskAI: (chunk: any, chunkIndex: number, type: string | null) => handleAskAI(chunk, chunk.node_id, chunk.page_num),
        variant: 'search' as const,
        index,
      };

      const paginateNodes = (nodes: any[]) => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return nodes.slice(startIndex, endIndex);
      };

      const renderCards = (nodes: any[], CardComponent: typeof TextCard | typeof TableCard | typeof GraphCard, type: 'text' | 'table' | 'graph') => {
        return paginateNodes(nodes).map((node) => {
          if (type === 'text') {
            const textCardData: SearchTextCardData = {
              variant: 'search',
              title: node.title || '',
              text: node.text || '',
              pageNumber: node.page_num || node.parent_chunk_page_num,
              node_id: node.node_id,
              parent_chunk_page_num: node.parent_chunk_page_num || node.page_num,
              parent_chunk_content: node.parent_chunk_content || '',
              node,
            };

            return (
              <div
                key={node.node_id}
                className="cursor-pointer mb-2"
              >
                <TextCard
                  {...commonProps}
                  textData={textCardData}
                />
              </div>
            );
          }

          if (type === 'table') {
            const tableCardData: SearchTableCardData = {
              variant: 'search',
              title: node.title || '',
              text: node.text || '',
              page_num: node.page_num,
              pageNumber: node.page_num || node.parent_chunk_page_num,
              node_id: node.node_id,
              pdfUrl: node.pdfUrl || '',
              table_with_caption: node.table_with_caption || '',
              table_without_caption: node.table_without_caption || '',
              table_html: tableChunksData?.[documentId]?.[node.page_num]?.find(
                (t: any) => t.table_id === node.node_id.split('_').pop()
              )?.table_html,
              node,
            };

            return (
              <div
                key={node.node_id}
                className="cursor-pointer mb-2"
              >
                <TableCard
                  {...commonProps}
                  tableData={tableCardData}
                  nodeViewStates={{ [node.node_id]: expandedNodes[node.node_id] || false }}
                  nodeHtmlContent={{
                    [node.node_id]: tableChunksData?.[documentId]?.[node.page_num]?.find(
                      (t: any) => t.table_id === node.node_id.split('_').pop()
                    )?.table_html?.join('') || '',
                  }}
                  onToggleView={(isExpanded) => handleToggleView(node.node_id, isExpanded)}
                  features={{
                    showViewToggle: true,
                    showModifyButton: true,
                    showActionButtons: true,
                    showSimilarTables: false,
                  }}
                />
              </div>
            );
          }

          if (type === 'graph') {
            const graphCardData: SearchGraphCardData = {
              variant: 'search',
              title: node.title || '',
              text: node.text || '',
              page_num: node.page_num,
              node_id: node.node_id,
              pdfUrl: node.pdfUrl || '',
              graph_with_caption: node.graph_with_caption || node.figure_with_caption || '',
              graph_without_caption: node.graph_without_caption || node.figure_without_caption || '',
              node,
            };

            return (
              <div
                key={node.node_id}
                className="cursor-pointer mb-2"
              >
                <GraphCard
                  {...commonProps}
                  graphData={graphCardData}
                />
              </div>
            );
          }

          return null;
        });
      };

      switch (activeTab) {
        case "keyTopics":
          return renderCards(documentResponse?.text_nodes || [], TextCard, 'text');
        case "tables":
          return renderCards(documentResponse?.table_nodes || [], TableCard, 'table');
        case "charts":
          return renderCards(documentResponse?.graph_nodes || [], GraphCard, 'graph');
        default:
          return null;
      }
    },
    [
      handleAddToWorkspace,
      handleAskAI,
      expandedNodes,
      tableChunksData,
      currentPage,
      activeTab,
      handleToggleView,
    ],
  );

  const containerClassName = `${
    selectedProject?.isSearchForAll
      ? "w-full"
      : "w-full max-w-[calc(100%-5px)]"
  } bg-[#fff] flex flex-col px-3 py-2 ml-2 gap-4 h-full rounded-t-[9px] mt-0 shadow-[0_-2px_12px_rgba(0,71,203,0.05)] transition-all duration-300 ease-in-out `;

  const renderMultipleDocument = (documents: any) => (
    <div className="flex flex-nowrap gap-2 w-full overflow-x-auto scrollbar-hide">
      {documents.map((documentResponse: any, index: any) => {
        const documentId = documentResponse?.id;
        return (
          <div
            key={index}
            className="flex flex-col gap-4 border-r-2 border-[#eaf0fc] items-center justify-start flex-[0_0_calc(50%-1rem)] min-w-[400px] max-w-[50%] h-screen bg-white rounded-lg p-3 pt-0"
          >
            <div className="flex gap-1 text-[#001742] bg-gray-100 rounded p-2 text-xs font-medium justify-center">
              <span>
                {cleanFileName(documentResponse?.name || `Document ${index + 1}`)}
              </span>
            </div>
            <div className="flex flex-col overflow-y-auto scrollbar-hide pb-[10rem] w-full max-h-[calc(100vh-80px)]">
              {!searchResults[sanitizedName(documentResponse?.url?.split("/").pop().split(".")[0])] ? (
                <SearchSkeleton type={activeTab}  />
              ) : (
                renderContent(
                  searchResults[sanitizedName(documentResponse?.url?.split("/").pop().split(".")[0])],
                  sanitizedName(documentResponse?.url?.split("/").pop().split(".")[0]),
                  index,
                  documentId
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderSingleDocument = (document: any) => (
    <div className="flex flex-col overflow-y-auto scrollbar-hide pb-[10rem] max-h-[calc(100vh-80px)]">
      {searchResults[sanitizedName(document?.url?.split("/").pop().split(".")[0])] ? (
        renderContent(
          searchResults[sanitizedName(document?.url?.split("/").pop().split(".")[0])],
          sanitizedName(document?.url?.split("/").pop().split(".")[0]),
          getDocumentIndex(document?.name),
          document?.id,
        )
      ) : (
        <div className="flex flex-col justify-center items-center gap-2 w-full">
          <label className="pt-16">
            <Image src={noElements} alt="Elements" width={70} height={70} />
          </label>
          <p className="text-[#4e5971] text-base font-normal leading-6">
            No elements for the given input, please modify and try again
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className={containerClassName}>
      <div className="flex items-center justify-between w-full">
        <div></div>
        {renderTabButtons()}
        <div className="p-1 cursor-pointer" onClick={onActionClick}>
          <X className="h-6" />
        </div>
      </div>

      {isLoading || !searchResults[sanitizedName(activeDocument?.url?.split("/").pop().split(".")[0])] ? (
        selectedProject?.isSearchForAll ? (
          renderMultipleDocument(selectedDocuments)
        ) : (
          <SearchSkeleton type={activeTab} />
        )
      ) : selectedProject?.isSearchForAll ? (
        renderMultipleDocument(selectedDocuments)
      ) : (
        renderSingleDocument(activeDocument)
      )}
    </div>
  );
};

export default SearchQuery;