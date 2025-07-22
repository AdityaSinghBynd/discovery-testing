import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "@/styles/TableChunk.module.scss";
import extractedTableStyles from "@/styles/ExtractedTableStyles.module.scss";
import Table from "../../../public/images/table1.svg";
import ToolBar from "@/components/ToolBar";
import HTMLToTable from "@/components/Html/Table";

interface TableChunk {
  title: string;
  description: string;
  table_without_caption: string;
  extractedTableData?: any[][];
  table_html: string[];
  table_id: string;
  pageNumber: number;
}

interface TableChunkProps {
  tableChunk: TableChunk;
  extractedTableData: any[][];
  isActive: boolean;
  index: number;
  onToggleTableExpand: (event: React.MouseEvent, index: number) => void;
  onAddToWorkspace: (chunk: any) => void;
  onAskAI: (chunk: any, index: number, type: string) => void;
  currentPage: any;
}

export default function TableChunk({
  tableChunk,
  extractedTableData,
  isActive,
  index,
  onToggleTableExpand,
  onAddToWorkspace,
  onAskAI,
  currentPage,
}: TableChunkProps) {
  const [expandedHeight, setExpandedHeight] = useState<number>(0);
  const expandedContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (expandedContentRef.current) {
      setExpandedHeight(expandedContentRef.current.scrollHeight);
    }
  }, [isActive, tableChunk]);

  const handleAddToWorkspace = () => {
    const workspaceElement = {
      tableCaption: tableChunk?.table_without_caption || null,
      generated_title: tableChunk.title,
      content: tableChunk.description,
      image: tableChunk.table_without_caption,
      elementType: "table",
      htmlContent: tableChunk.table_html[0],
    };
    onAddToWorkspace(workspaceElement);
  };

  return (
    <div
      className={`${styles.tableCard} ${isActive ? styles.expandedCard : ""}`}
      onClick={(e) => onToggleTableExpand(e, index)}
    >
      <div className={styles.tableHead}>
        <label>
          <Image src={Table} alt="Table" />
        </label>
        <h4>{tableChunk.title}</h4>
      </div>
      <div className={styles.tableDescription}>
        <p>{tableChunk.description}</p>
      </div>

      <div className={styles.expandedContentContainer}>
        {isActive && (
          <div className={styles.toolbarWrapper}>
            <ToolBar
              context={{
                contentToCopy: tableChunk.table_html[0],
                tableTitle: tableChunk.title,
                isTable: true,
                tableId: tableChunk.table_id,
                currentPage: currentPage
              }}
              onAddToWorkspace={handleAddToWorkspace}
              onAskAI={() => onAskAI(tableChunk, index, "table")}
              features={{
                showActionButtons: true,
                showSimilarTables: true,
                showModifyButton: true
              }}
            />
          </div>
        )}

        <div
          ref={expandedContentRef}
          className={`${styles.expandedContent} ${isActive ? styles.active : ""}`}
          style={{ maxHeight: isActive ? `400px` : "0px" }}
        >
          <div className="w-full flex justify-center items-center">
            <HTMLToTable
              htmlContent={tableChunk.table_html[0]}
              className={extractedTableStyles.styledTable}
            />
          </div>
        </div>
      </div>
    </div>
  );
}