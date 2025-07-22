import React, { useEffect, useState } from "react";
import styles from "@/styles/workspace.module.scss";
import { WorkspaceElement } from "@/interface/WorkspaceElement";
import Head from "next/head";
import { useDispatch, useSelector } from "react-redux";
import { selectElementById, hasNextPage } from "@/redux/element/selector";
import { AppDispatch } from "@/store/store";
import { fetchElementsByWorkspaceId } from "@/redux/element/elementThunks";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/Skeleton/WorkspaceElements";
import WorkspaceHeader from "@/components/Workspace/Header";
import EditorSkeleton from "@/components/Skeleton/Search";
//import AskAIModal from "@/components/AskAImodal/AskAimodal";

const WorkspaceElements = dynamic(
  () => import("@/components/Workspace/WorkspaceElements"),
);
const DocumentEditor = dynamic(
  () => import("@/components/Workspace/DocumentEditor"),
  {
    ssr: false,
    loading: () => (
      <div className={styles.documentEditorContainer}>
        <EditorSkeleton />
      </div>
    ),
  },
);

interface EditorContent {
  id: string;
  content: string;
  imageCaption?: string;
  contentTitle?: string | null;
  pageNumber?: number;
  tableHtml?: string | null;
  elementType?: string;
}

const Workspace = ({ workspaceId }: { workspaceId: string }) => {
  const dispatch: AppDispatch = useDispatch();
  const [editorBlocks, setEditorBlocks] = useState<
    { id: string; content: string }[]
  >([{ id: "1", content: "" }]);
  const [elements, setElements] = useState<WorkspaceElement[]>([]);
  const [elementCount, setElementCount] = useState<number>(0);
  const specificElements = useSelector(selectElementById(String(workspaceId)));
  const [isLoading, setIsLoading] = useState(true);
  const [documentTitle, setDocumentTitle] = useState("Untitled");
  const [editorContent, setEditorContent] = useState<EditorContent[]>([]);
  const handleTitleChange = (newTitle: string) => {
    setDocumentTitle(newTitle);
  };

  useEffect(() => {
    const fetchElements = async () => {
      if (workspaceId) {
        try {
          setIsLoading(true);
          await dispatch(
            fetchElementsByWorkspaceId({
              workspaceId: String(workspaceId),
              page: 1,
            }),
          );
        } catch (error) {
          console.error("Error fetching elements:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchElements();
  }, [workspaceId, dispatch]);

  useEffect(() => {
    if (specificElements && specificElements.length > 0) {
      setElements(specificElements);
      setElementCount(specificElements.length);
    }
  }, [specificElements]);

  const addContentToEditor = (
    content: string,
    imageCaption?: string,
    contentTitle?: string | null,
    pageNumber?: number,
    tableHtml?: string | null,
    elementType?: string,
  ) => {
    const newBlock = {
      id: Date.now().toString(),
      content,
      imageCaption: imageCaption || "",
      contentTitle,
      pageNumber,
      tableHtml,
      elementType,
    };

    setEditorContent((prev) => [...prev, newBlock]);
    setEditorBlocks((prev) => [...prev, newBlock]);
  };

  const handleDeleteElement = (index: number) => {
    setElements((prev) => {
      const updatedElements = [...prev];
      updatedElements.splice(index, 1);
      return updatedElements;
    });
    setElementCount((prevCount) => prevCount - 1);
  };

  const handleRestoreElement = (index: number, element: WorkspaceElement) => {
    setElements((prev) => {
      const updatedElements = [...prev];
      updatedElements.splice(index, 0, element);
      return updatedElements;
    });
    setElementCount((prevCount) => prevCount + 1);
  };

  return (
    <>
      <Head>
        <title>Bynd - Workspace</title>
        <meta
          name="description"
          content="Workspace for managing elements in Bynd."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/ByndLogoFavicon.svg" />
      </Head>
      <div style={{ backgroundColor: "#f7f9fe" }}>
        <div className={styles.WorkspaceHeader}>
          <WorkspaceHeader
            elements={elements}
            blocks={editorBlocks}
            setBlocks={setEditorBlocks}
            documentTitle={documentTitle}
            onTitleChange={handleTitleChange}
          />
        </div>
        <div className={styles.workspaceContainer}>
          <div className={styles.workspaceElements}>
            {isLoading ? (
              <SkeletonLoader />
            ) : (
              <WorkspaceElements
                elements={elements}
                addContentToEditor={addContentToEditor}
                onElementCountChange={setElementCount}
                onDeleteElement={handleDeleteElement}
                onRestoreElement={handleRestoreElement}
                workspaceId={Number(workspaceId)}
              />
            )}
          </div>
          <div className={styles.documentEditorArea}>
            <DocumentEditor
              documentTitle={documentTitle}
              onTitleChange={handleTitleChange}
              newContent={editorContent[editorContent.length - 1]}
            />
          </div> 
        </div>
      </div>
    </>
  );
};

export default Workspace;
