import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { setLocalPageLock, setSearchState } from '@/redux/projectDocuments/projectDocumentsSlice';
import { updateDocument, updateProject } from '@/redux/projectDocuments/projectDocumentsThunks';
import { track } from "@amplitude/analytics-browser";
import { addElement } from '@/redux/element/elementThunks';
import { setSelectedData, setIsOpen } from '@/redux/askAi/askAiSlice';
import { useSectionAndSubheading } from './useSectionAndSubheading';

type ElementType = 'text' | 'table' | 'graph';

interface UseCardInteractionsConfig {
  variant?: 'chunks' | 'search' | 'workspace';
}

export const useCardInteractions = (config?: UseCardInteractionsConfig) => {
  const dispatch = useDispatch<AppDispatch>();
  const { getSectionAndSubheading: getSection, getSectionIndex } = useSectionAndSubheading();
  
  const { selectedDocuments, activeDocument } = useSelector(
    (state: RootState) => state.projectDocuments,
  );
  
  const selectedProject = useSelector(
    (state: RootState) => state.projectDocuments.selectedProject,
  );

  const workspaceId = useMemo(
    () => selectedProject?.workspace?.id,
    [selectedProject?.workspace?.id],
  );

  /**
   * Handles clicking on the search link icon to navigate to a specific page
   */
  const handleSearchClick = useCallback((pageNumber: number, documentIndex: number) => {
    track("search_click", { documentId: selectedDocuments[documentIndex]?.id, pageNumber });
    
    dispatch(setLocalPageLock({
      documentId: selectedDocuments[documentIndex]?.id,
      lockedPage: pageNumber,
      isActive: true,
    }));

    dispatch(setSearchState({
      isSearchForAll: false,
      isSearched: false,
      recentSearch: "",
    }));

    dispatch(updateDocument({
      documentId: selectedDocuments[documentIndex]?.id,
      projectId: selectedProject?.id,
      payload: {
        lockedPage: pageNumber,
        isActive: true,
      },
    }));
  }, [dispatch, selectedDocuments, selectedProject]);

  /**
   * Handles adding a text element to the workspace
   */
  const handleAddTextToWorkspace = useCallback(async (
    data: any,
    contentTitle: string,
    pageNumber: number | null,
    content: string,
  ) => {
    const workspaceElement = {
      aiSummary: "",
      contentTitle,
      content,
      imageCaption: "",
      elementType: "text" as ElementType,
      pageNumber: parseInt(String(pageNumber || 0), 10),
      sectionName: getSectionIndex(pageNumber || 0),
      htmlContent: null,
      workspaceId,
    };
    
    return await dispatch(addElement(workspaceElement)).unwrap();
  }, [dispatch, getSectionIndex, workspaceId]);

  /**
   * Handles adding a table element to the workspace
   */
  const handleAddTableToWorkspace = useCallback(async (
    data: any,
    contentTitle: string,
    pageNumber: number | null,
    content: string,
    imageCaption: string,
    htmlContent?: string | null,
  ) => {
    const workspaceElement = {
      aiSummary: "",
      contentTitle,
      content,
      imageCaption,
      elementType: "table" as ElementType,
      pageNumber: parseInt(String(pageNumber || 0), 10),
      sectionName: getSectionIndex(pageNumber || 0),
      htmlContent: htmlContent || null,
      workspaceId,
    };
    
    return await dispatch(addElement(workspaceElement)).unwrap();
  }, [dispatch, getSectionIndex, workspaceId]);

  /**
   * Handles adding a graph element to the workspace
   */
  const handleAddGraphToWorkspace = useCallback(async (
    data: any,
    contentTitle: string,
    pageNumber: number | null,
    content: string,
    imageCaption: string,
  ) => {
    const workspaceElement = {
      aiSummary: "",
      contentTitle,
      content,
      imageCaption,
      elementType: "graph" as ElementType,
      pageNumber: parseInt(String(pageNumber || 0), 10),
      sectionName: getSectionIndex(pageNumber || 0),
      htmlContent: null,
      workspaceId,
    };
    
    return await dispatch(addElement(workspaceElement)).unwrap();
  }, [dispatch, getSectionIndex, workspaceId]);

  /**
   * Handles opening the AskAI dialog for a text element
   */
  const handleTextAskAI = useCallback((data: any, index: number, title: string, content: string, pageNumber: number) => {
    const aiPayload = {
      ...data,
      type: "text",
      isTableChunk: false,
      generated_title: title,
      content,
      pageNumber,
    };
    
    dispatch(setSelectedData(aiPayload));
    dispatch(setIsOpen());
  }, [dispatch]);

  /**
   * Handles opening the AskAI dialog for a table element
   */
  const handleTableAskAI = useCallback((
    data: any, 
    index: number, 
    title: string, 
    content: string, 
    pageNumber: number, 
    imageSrc: string,
    tableHtml?: string
  ) => {
    const aiPayload = {
      ...data,
      type: "table",
      isTableChunk: false,
      generated_title: title,
      content: content || "",
      imageSrc: imageSrc || "",
      pageNumber,
      table_html: tableHtml ? [tableHtml] : undefined
    };
    
    dispatch(setSelectedData(aiPayload));
    dispatch(setIsOpen());
  }, [dispatch]);

  /**
   * Handles opening the AskAI dialog for a graph element
   */
  const handleGraphAskAI = useCallback((data: any, index: number, title: string, content: string, pageNumber: number, imageSrc: string) => {
    const aiPayload = {
      ...data,
      type: "graph",
      isTableChunk: false,
      generated_title: title,
      content: content || "",
      imageSrc: imageSrc || "",
      pageNumber,
    };
    
    dispatch(setSelectedData(aiPayload));
    dispatch(setIsOpen());
  }, [dispatch]);

  /**
   * Handles deletion of an element from the workspace
   */

  return {
    handleSearchClick,
    handleAddTextToWorkspace,
    handleAddTableToWorkspace,
    handleAddGraphToWorkspace,
    handleTextAskAI,
    handleTableAskAI,
    handleGraphAskAI,
    workspaceId,
    selectedDocuments,
    selectedProject,
    activeDocument,
  };
}; 