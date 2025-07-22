import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
//import AskAIModal from "@/components/AskAImodal/AskAimodal";
import { ExpandedSection } from "./ExpandableSection";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/interface/components/AISummary.interface";
import noElements from "../../../public/images/workspaceElements.svg";
import aiIcon from "../../../public/images/Vector.svg";
import AISummarySkeleton from "@/components/Skeleton/AISummary";
import { AppDispatch, RootState } from "@/store/store";
import { fetchAiSummary } from "@/redux/aiSummary/aiSummaryThunks";
import { X } from "lucide-react";

interface Props {
  documentId: number;
  onClose: () => void;
}

const AISummary: React.FC<Props> = ({ documentId, onClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    content: null,
  });

  const { activeDocument } = useSelector(
    (state: RootState) => state.projectDocuments,
  );

  const { summary, status, error } = useSelector(
    (state: RootState) => state.summary,
  );

  const currentDocumentSummary = useMemo(
    () => summary[activeDocument.id]?.documents || {},
    [summary, activeDocument.id],
  );

  const hasSummary = useMemo(
    () => Object.keys(currentDocumentSummary).length > 0,
    [currentDocumentSummary],
  );

  useEffect(() => {
    if (documentId && !summary[documentId]?.documents && status !== "loading") {
      dispatch(fetchAiSummary(documentId));
    }
  }, [dispatch, documentId, summary, status]);

  const handleModalOpen = useCallback((content: any) => {
    setModalState({
      isOpen: true,
      content: {
        generated_title: "",
        tableHead: content.tableHead,
        content: content.content,
        messages: [],
        imageSrc: null,
      },
    });
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  if (error) {
    return (
      <div className="text-red-500 p-4">
        {error || "Error loading documents"}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-[90vh] bg-white rounded-[10px] shadow-custom-blue ml-2">
      <div className="flex px-3 py-2 gap-2 items-center rounded-t-[10px] justify-between border-b-2 border-[#eaf0fc]">
        <div className="flex flex-row items-center gap-2">
          <Image src={aiIcon} alt="ai-icon" />
          <h3 className="text-[#001742] text-lg font-medium leading-6 m-0">
            AI Summary
          </h3>
        </div>
        <X className="h-5 w-5 text-600 mr-2 cursor-pointer" onClick={onClose} />
      </div>

      <div className="flex-1 w-full p-2 pb-20 bg-[#f7f9fe] gapp-3 overflow-y-auto scrollbar-hide bg-white">
        {status === "loading" ? (
          <div className="flex p-2 pt-0 w-full overflow-hidden">
            <AISummarySkeleton />
          </div>
        ) : hasSummary ? (
          Object.entries(currentDocumentSummary).map(([id, doc], index) => (
            <ExpandedSection
              key={`${id}-${index}`}
              document={doc as any}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              onAskAI={handleModalOpen}
            />
          ))
        ) : (
          <div className="flex flex-col justify-center items-center gap-2 w-full">
            <label className="pt-16">
              <Image src={noElements} alt="Elements" />
            </label>
            <p className="text-[#4e5971] text-base font-normal leading-6">
              No AI summary available for the selected document
            </p>
          </div>
        )}
      </div>

      {/* <AskAIModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        selectedContent={modalState.content}
        tableChunk={[]}
      /> */}
    </div>
  );
};

export default React.memo(AISummary);
