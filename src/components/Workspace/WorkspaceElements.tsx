import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import Image from "next/image";
import Elements from "../../../public/images/workspaceElements.svg";
import { useDispatch, useSelector } from "react-redux";
import { setElementCount } from "../../redux/elementSlice";
import UndoPopup from "@/components/UndoPopup/UndoPopup";
import ApiService from "@/services/service";
import { getSession } from "next-auth/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { AppDispatch, RootState } from "@/store/store";
import { fetchElementsByWorkspaceId } from "@/redux/element/elementThunks";
import {
  setCurrentPage,
  resetPagination,
  setSelectedTableIds,
  updateElementDetails,
  removeElementDetails,
} from "@/redux/element/elementSlice";
import { WorkspaceElementsProps } from "@/interface/components/workspaceElements.interface";
import TextCard from "@/components/TextCard";
import TableCard from "@/components/TableCard";
import GraphCard from "@/components/GraphCard";
import { useCardInteractions } from "@/hooks/useCardInteractions";

const WorkspaceElements: React.FC<WorkspaceElementsProps> = ({
  elements,
  addContentToEditor,
  onElementCountChange,
  onDeleteElement,
  onRestoreElement,
  workspaceId,
}) => {
  console.log("elements",elements)
  const dispatch = useDispatch<AppDispatch>();
  const hiddenSections = useSelector(
    (state: RootState) => state.workspace.hiddenSections,
  );
  const hasMore = useSelector((state: RootState) => state.elements.hasNextPage);
  const loading = useSelector((state: RootState) => state.elements.loading);
  const currentPage = useSelector(
    (state: RootState) => state.elements.currentPage,
  );
  const selectedTableIds = useSelector((state: RootState) => state.elements.selectedTableIds);
  const { handleGraphAskAI, handleTextAskAI, handleTableAskAI } = useCardInteractions();

  const [localElements, setLocalElements] = useState(elements);
  const [addedElements, setAddedElements] = useState<Set<number>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState(null);
  const [deletedElement, setDeletedElement] = useState<{
    index: number;
    element: any;
  } | null>(null);
  const [tableIds, setTableIds] = useState<Set<string>>(new Set());
  const [nodeViewStates, setNodeViewStates] = useState<{
    [key: string]: boolean;
  }>({});

  const visibleElements = useMemo(() => {
    const hiddenSectionsSet = new Set(hiddenSections);
    return elements.filter(
      (element) => !hiddenSectionsSet.has(element.sectionName),
    );
  }, [elements, hiddenSections]);

  useEffect(() => {
    onElementCountChange(visibleElements.length);
    dispatch(setElementCount(elements.length));
  }, [visibleElements.length, elements.length, dispatch, onElementCountChange]);

  useEffect(() => {
    if (workspaceId) {
      dispatch(resetPagination());
      dispatch(
        fetchElementsByWorkspaceId({
          workspaceId: Number(workspaceId),
          page: 1,
        }),
      );
    }
  }, [dispatch, workspaceId]);

  useEffect(() => {
    setTableIds(new Set(selectedTableIds));
  }, [selectedTableIds]);

  const fetchMoreData = useCallback(() => {
    if (!hasMore || loading || !workspaceId) return;

    const nextPage = currentPage + 1;
    dispatch(setCurrentPage(nextPage));
    dispatch(
      fetchElementsByWorkspaceId({
        workspaceId: Number(workspaceId),
        page: nextPage,
      }),
    );
  }, [dispatch, workspaceId, currentPage, hasMore, loading]);

  const handleImageClick = useCallback((id: any, event: any) => {
    event.stopPropagation();
    setExpandedId((prevId) => (prevId === id ? null : id));
  }, []);

  const handleContentAdd = useCallback(
    (
      content: string,
      imageCaption: string | undefined,
      contentTitle: string | null,
      pageNumber: number,
      tableHtml: string | null = null,
      index: number,
      elementType?: string
    ) => {
      addContentToEditor(
        content,
        imageCaption,
        contentTitle,
        pageNumber,
        tableHtml,
        elementType
      );

      setAddedElements((prev) => new Set(prev).add(index));
    },
    [addContentToEditor, setAddedElements]
  );

  const handleDeleteElement = useCallback(
    async (index: number) => {
      const elementToDelete = localElements[index];
      setLocalElements((prev) => prev.filter((_, i) => i !== index));
      setDeletedElement({ element: elementToDelete, index });
      onDeleteElement(index);

      const session = await getSession();
      await ApiService.apiCall(
        "delete",
        `/elements/${elements[index].id}`,
        {},
        session?.accessToken,
      );
    },
    [localElements, elements, onDeleteElement],
  );

  // const handleCheckboxChange = useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement>, element: any) => {
  //     const newTableIds = new Set(tableIds);
  //     if (e.target.checked) {
  //       newTableIds.add(element.id);
  //       if (element.html) {
  //         dispatch(
  //           updateElementDetails({
  //             id: element.id,
  //             pageNumber: element.pageNumber,
  //             contentTitle: element.contentTitle,
  //             html: element.html,
  //           }),
  //         );
  //       }
  //     } else {
  //       newTableIds.delete(element.id);
  //       dispatch(removeElementDetails(element.id));
  //     }
  //     setTableIds(newTableIds);
  //     dispatch(setSelectedTableIds(Array.from(newTableIds)));
  //   },
  //   [tableIds, dispatch],
  // );

  const handleUndo = useCallback(() => {
    if (deletedElement) {
      onRestoreElement(deletedElement.index, deletedElement.element);
      setDeletedElement(null);
    }
  }, [deletedElement, onRestoreElement]);

  const renderCardByType = (element: any, index: number) => {
    const onAddToWorkspace = () => { };

    switch (element.elementType) {
      case "text":
        return (
          <TextCard
            variant="workspace"
            textData={{
              variant: 'workspace',
              contentTitle: element.contentTitle,
              pageNumber: element.pageNumber,
              sectionName: element.sectionName,
              elementType: "text",
              content: element.content,
              id: element.id || ""
            }}
            onAddToWorkspace={onAddToWorkspace}
            index={index}
            onDelete={() => handleDeleteElement(index)}
            onAskAI={(chunk: any, index: number, type: string | null) => {
              handleTextAskAI(
                chunk,
                index,
                chunk.contentTitle,
                chunk.content,
                chunk.pageNumber
              );
            }}
            onAddContent={(content: string, imageCaption: string | undefined, contentTitle: string, pageNumber: number, tableHtml: string | null) => {
              handleContentAdd(content, imageCaption, contentTitle, pageNumber, tableHtml, index, "text");
            }}
          />
        );
      case "table":
        return (
          <TableCard
            variant="workspace"
            tableData={{
              variant: 'workspace',
              contentTitle: element.contentTitle,
              pageNumber: element.pageNumber,
              content: element.content,
              imageCaption: element.imageCaption,
              sectionName: element.sectionName,
              parent_chunk_page_num: element.pageNumber,
              table_html: element.html,
              id: element.id || "",
              page_num: element.pageNumber,
              elementType: "table"
            }}
            onAddToWorkspace={onAddToWorkspace}
            index={index}
            onDelete={() => handleDeleteElement(index)}
            onAddContent={(content: string, imageCaption: string | undefined, contentTitle: string, pageNumber: number, tableHtml: string | null) => {
              handleContentAdd(content, imageCaption, contentTitle, pageNumber, tableHtml, index, "table");
            }}
          />
        );
      case "graph":
        return (
          <GraphCard
            variant="workspace"
            graphData={{
              variant: 'workspace',
              contentTitle: element.contentTitle,
              pageNumber: element.pageNumber,
              content: element.content,
              imageCaption: element.imageCaption,
              figure_without_caption: element?.figure_without_caption,
              sectionName: element.sectionName,
              id: element.id || "",
              elementType: "graph"
            }}
            onAddToWorkspace={onAddToWorkspace}
            onDelete={() => handleDeleteElement(index)}
            onAskAI={(chunk: any, index: number, type: string | null) => {
              handleGraphAskAI(
                chunk,
                index,
                chunk.contentTitle,
                chunk.content,
                chunk.pageNumber,
                chunk.imageCaption || chunk.figure_without_caption
              );
            }}
            onAddContent={(content: string, imageCaption: string | undefined, contentTitle: string, pageNumber: number, tableHtml: string | null) => {
              handleContentAdd(content, imageCaption, contentTitle, pageNumber, tableHtml, index, "graph");
            }}
            index={index}
          />
        );
    }
  };

  return (
    <>
      <div
        id="scrollableDiv"
        className="relative flex-auto flex-col gap-2 w-full min-h-0 overflow-y-auto pb-[100px]"
        ref={scrollContainerRef}
      >
        <InfiniteScroll
          dataLength={elements?.length || 0}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            loading && (
              <div className="flex justify-center p-4">
                <div className="w-12 h-12 border-3 border-gray-200 rounded-full animate-spin border-t-blue-500"></div>
              </div>
            )
          }
          scrollableTarget="scrollableDiv"
          style={{ overflow: "visible" }}
        >
          {visibleElements && visibleElements.length > 0 ? (
            visibleElements.map((element, index) => (
              <div key={index} className={`${index === 0 ? "mt-0" : "mt-3"}`}>
                {renderCardByType(element, index)}
              </div>
            ))
          ) : (
            <div className="flex flex-col justify-center items-center gap-2.5">
              <label className="pt-[60px]">
                <Image src={Elements} alt="Elements" />
              </label>
              <p className="m-0 text-[#4e5971] text-base font-normal leading-6">
                No workspace elements added yet.
              </p>
            </div>
          )}
        </InfiniteScroll>
      </div>
      {deletedElement && (
        <UndoPopup
          message={`${deletedElement.element?.contentTitle || "Element"}`}
          onUndo={handleUndo}
          onClose={() => setDeletedElement(null)}
        />
      )}
    </>
  );
};

export default React.memo(WorkspaceElements);