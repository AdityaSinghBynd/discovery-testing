import { useState } from "react";
import { useDispatch } from "react-redux";
import { addElement } from "@/redux/element/elementThunks";

export const useNodeManagement = (workspaceId: string | string[]) => {
  const [addedItems, setAddedItems] = useState(new Set());
  const dispatch = useDispatch();

  const findSectionIndex = (pageNum: number, sections: any[]) => {
    for (const section of sections) {
      if (pageNum >= section.startPage && pageNum <= section.endPage) {
        return section.index;
      }
    }
    return null;
  };

  const handleAddToWorkspace = async (node: any, sections: any[]) => {
    const sectionName = findSectionIndex(
      node.page_num || node.parent_chunk_page_num,
      sections,
    );

    const pageNum = node.page_num || node.parent_chunk_page_num || 1;
    const pageNumber =
      typeof pageNum === "string" ? parseInt(pageNum, 10) : pageNum;

    const payload = {
      workspaceId: Number(workspaceId),
      elementType: node.table_without_caption
        ? "table"
        : node.graph_without_caption
          ? "graph"
          : "text",
      imageCaption:
        node.table_without_caption || node.graph_without_caption || node.figure_without_caption || null,
      content: node.text || null,
      pageNumber,
      contentTitle: node.title || null,
      aiSummary: "",
      sectionName,
    };

    // try {
    //   // const result = await dispatch(addElement(payload));
    //   if (!('error' in result)) {
    //     setAddedItems((prev) => new Set(prev).add(node.node_id));
    //   }
    // } catch (error) {
    //   console.error('Error adding element:', error);
    // }
  };

  return { addedItems, handleAddToWorkspace };
};
