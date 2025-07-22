import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "@/styles/TableChunk.module.scss";
import extractedTableStyles from "@/styles/ExtractedTableStyles.module.scss";
import graphIcon from "../../../public/images/graph1.svg";
import ToolBar from "@/components/ToolBar";

interface GraphChunk {
  title: string;
  description: string | object;
  figure_without_caption: string;
  figure_with_caption: string;
  table_html: string;
}

interface TableRow {
  [key: string]: string | number | object;
}

interface TableChunkProps {
  graphChunk: GraphChunk;
  isActive: boolean;
  index: number;
  onToggleGraphExpand: (event: React.MouseEvent, index: number) => void;
  onAddToWorkspace: (chunk: any) => void;
  onAskAI: (chunk: any, index: number, chunkType: string) => void;
  currentPage: any;
  pdfUrl: string;
}

export default function GraphChunk({
  graphChunk,
  isActive,
  index,
  onToggleGraphExpand,
  onAddToWorkspace,
  onAskAI,
  currentPage,
  pdfUrl,
}: TableChunkProps) {
  console.log('graphChunk', graphChunk)
  const [expandedHeight, setExpandedHeight] = useState<number>(0);
  const expandedContentRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (expandedContentRef.current) {
      setExpandedHeight(expandedContentRef.current.scrollHeight);
    }
  }, [isActive, graphChunk]);

  const handleAddToWorkspace = () => {
    const workspaceElement = {
      graphCaption: graphChunk?.figure_without_caption || null,
      generated_title: graphChunk.title,
      content: graphChunk.description,
      imageCaption: graphChunk.figure_without_caption,
      elementType: "graph",
    };
    onAddToWorkspace(workspaceElement);
  };

  return (
    <div
      className={`${styles.tableCard} ${isActive ? styles.expandedCard : ""}`}
      onClick={(e) => onToggleGraphExpand(e, index)}
    >
      <div className={styles.tableHead}>
        <label>
          <Image src={graphIcon} alt="Table" />
        </label>
        <h4>{graphChunk.title}</h4>
      </div>
      <div className={styles.tableDescription}>
        <p>
          {typeof graphChunk.description === "string"
            ? graphChunk.description
            : "N/A"}
        </p>
      </div>

      <div className={styles.expandedContentContainer}>
        {isActive && typeof graphChunk.description === "string" && (
          <div className={styles.toolbarWrapper}>
            <ToolBar
              context={{
                contentToCopy: graphChunk.figure_with_caption,
                tableTitle: "",
                isGraphChunk: true,
                pageNumber: currentPage,
                pdfUrl: pdfUrl,
                ImageUrl: graphChunk.figure_with_caption
              }}
              onAddToWorkspace={handleAddToWorkspace}
              onAskAI={() => onAskAI(graphChunk, index, "graph")}
              features={{
                showActionButtons: true,
                showModifyButton: true
              }}
            />
          </div>
        )}

        <div
          ref={expandedContentRef}
          className={`${styles.expandedContent} ${isActive ? styles.active : ""}`}
          style={{ maxHeight: isActive ? `${expandedHeight}px` : "0px" }}
        >
          <div className={styles.imageWrapper}>
            <img
              src={graphChunk.figure_without_caption}
              alt={graphChunk.title || "Graph Image"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
