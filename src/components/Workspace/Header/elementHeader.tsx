import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import styles from "@/styles/WorkspaceHeader.module.scss";
import Filter from "@/components/Filter";
import { useExcelDownload } from "@/hooks/Toolbar/useExcelDownload";
import { resetElementDetails, setSelectedTableIds } from "@/redux/element/elementSlice";
import { toast } from "react-toastify";

interface ElementHeaderProps {
  elements: any[];
}

const ElementHeader: React.FC<ElementHeaderProps> = ({ elements }) => {
  const dispatch = useDispatch();
  const elementDetails = useSelector(
    (state: RootState) => state.elements.elementDetails,
  );
  const selectedTableIds = useSelector(
    (state: RootState) => state.elements.selectedTableIds,
  );

  const elementSectionName = Array.from(
    new Set(elements?.map((element: any) => element.sectionName)),
  );

  const { downloadMultipleExcel, finalizeDownload } = useExcelDownload();

  const handleMultipleExport = async () => {
    try {
      if (Object.keys(elementDetails).length === 0) {
        toast.warning("No tables selected for export");
        return;
      }

      window.combinedWorkbook = null; 

      const contentToCopy: string[] = [];
      const tableTitles: string[] = [];
      
      Object.values(elementDetails).forEach(({ html, contentTitle }) => {
        contentToCopy.push(html);
        tableTitles.push(contentTitle);
      });

      await downloadMultipleExcel(contentToCopy, tableTitles);
      await finalizeDownload();
      
      dispatch(resetElementDetails());
      dispatch(setSelectedTableIds([]));
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.");
      dispatch(resetElementDetails());
      dispatch(setSelectedTableIds([]));
    }
  };

  return (
    <div className={styles.elementHeaderContainer}>
      <div className={styles.elementsHeader}>
        <div className={styles.elementTitle}>
          <p>Workspace Element</p>
        </div>
        <div className={styles.elementFilter}>
          <button 
            className={`${Object.keys(elementDetails || {}).length === 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600"} pr-3`} 
            onClick={handleMultipleExport} 
            disabled={Object.keys(elementDetails || {}).length === 0}
          >
            Export In Excel
          </button>
       {/*   <Filter
            elementSectionName={elementSectionName}
            page="workspace"
            sections={undefined}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default ElementHeader;
