import React, { useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import GrayActionIcon from "../../../public/images/GrayCancel.svg";
import GrayPlusIcon from "../../../public/images/GrayPlus.svg";
import PdfIcon from "../../../public/images/pdfIcon.svg";
import { useRouter } from "next/router";
import { setIsOpen } from "@/redux/createProjectModal/createProjectModal";
import {
  deleteTab,
  updateDocument,
} from "@/redux/projectDocuments/projectDocumentsThunks";
import { deleteProjectThunk } from "@/redux/project/projectThunks";
import { setActiveDocuments } from "@/redux/projectDocuments/projectDocumentsSlice";
import { Document } from "@/interface/components/tabs.interface";

const Tabs = () => {
  const dispatch: AppDispatch = useDispatch();
  const { selectedDocuments, activeDocument } = useSelector(
    (state: RootState) => state.projectDocuments,
  );
  const route = useRouter();
  const { slug } = route.query;
  const [hoveredDocumentId, setHoveredDocumentId] = useState<string | null>(
    null,
  );

  const handleFileClick = (document: Document) => {
    dispatch(
      setActiveDocuments({
        id: document?.id,
      }),
    );

    setTimeout(() => {
      dispatch(
        updateDocument({
          documentId: document.id,
          projectId: slug as string,
          payload: {
            isActive: true,
          },
        }),
      );
    }, 500);
  };

  const handlePlusButtonClick = () => {
    dispatch(setIsOpen(true));
  };

  const handleCloseClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (typeof slug === "string" && id) {
      try {
        await dispatch(
          deleteTab({ payload: { documentId: id, projectId: slug } }),
        ).unwrap();
        if (selectedDocuments.length === 1) {
          await dispatch(deleteProjectThunk(Number(slug))).unwrap();
          route.push("/");
        }
      } catch (error) {
        console.error("Error deleting document or project:", error);
      }
    }
  };

  return (
      <div className="flex items-center relative">
        {selectedDocuments?.length ? (
          <>
            <div className="flex gap-1 items-center">
              {selectedDocuments.map((document: any, index: number) => {
                const isActiveOrHovered =
                  document?.isActive || hoveredDocumentId === document?.id;

                return (
                  <div
                    className={`flex items-center relative border-b-2 ${
                      document?.isActive ? "border-[#004CE6]" : "border-[#eaf0fc]"
                    }`}
                    key={document?.id}
                    onMouseEnter={() => setHoveredDocumentId(document?.id)}
                    onMouseLeave={() => setHoveredDocumentId(null)}
                  >
                    <div
                      className={`
                      relative flex items-center 
                      w-[300px] min-w-[300px] h-8 
                      rounded-t px-2 py-1 
                      cursor-pointer 
                      transition-all duration-300 ease-in-out 
                      box-border
                      ${
                        isActiveOrHovered
                          ? "!bg-white shadow-custom-blue"
                          : "bg-transparent hover:!bg-white"
                      }
                      `}
                      onClick={() => handleFileClick(document)}
                    >
                      <Image src={PdfIcon} alt="PDF" className="w-4 h-4" />
                      <span className="flex-grow flex-shrink text-ellipsis whitespace-nowrap overflow-hidden text-[#4e5971] text-[12px] font-medium leading-4 mx-1 min-w-0">
                        {document?.name
                          .replace(/[^a-zA-Z0-9\s]/g, " ")
                          .toUpperCase() || `DOCUMENT ${index + 1}`}
                      </span>
                      {(document?.isActive ||
                        hoveredDocumentId === document?.id) && (
                        <Image
                          src={GrayActionIcon}
                          alt="Close"
                          className="w-5 h-5 ml-auto cursor-pointer"
                          onClick={(e) => handleCloseClick(e, document?.id)}
                        />
                      )}
                    </div>

                    {index < selectedDocuments.length - 1 && (
                      <div
                        className={`w-[1px] h-5 bg-[#9babc7] opacity-35 transition-opacity duration-300 
                          ${
                            document?.isActive ||
                            selectedDocuments[index + 1]?.isActive ||
                            hoveredDocumentId === document?.id ||
                            hoveredDocumentId ===
                              selectedDocuments[index + 1]?.id
                              ? "opacity-0"
                              : "opacity-35"
                          }`}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>
            <div
              onClick={handlePlusButtonClick}
              className="flex-shrink-0 flex items-center justify-center cursor-pointer rounded-full p-1 m-1 transition-shadow duration-200 ease-in-out hover:shadow-[1px_2px_4px_0_rgba(0,76,230,0.05)] hover:bg-[#Layer02]"
            >
              <Image src={GrayPlusIcon} alt="Plus" className="w-5 h-auto" />
            </div>
          </>
        ) : (
          <div className="w-full max-w-xl mx-auto rounded-lg p-1 flex items-center">
            {[...Array(5)].map((_, index) => (
              <React.Fragment key={index}>
                <div className="flex-1">
                  <div className="h-8 bg-[#fff] rounded-md w-[300px] flex items-center gap-1 px-1 py-2">
                    <Image src={PdfIcon} alt={"Icon"} />
                    <div className="h-2 bg-[#eaf0fc] rounded-md w-[200px] rounded-[4px] flex items-center px-1 py-2 animate-pulse"></div>
                  </div>
                </div>
                {index < 4 && <div className="w-px h-6 bg-gray-300 mx-1"></div>}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
  );
};

export default Tabs;
