import React, { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import NoDocument from "../../../public/images/noDocument.svg";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import SectionCard from "./SectionCard";
import SectionPage from "./SectionPage";
import PageExplorerSkeleton from "../Skeleton/PageExplorer";
import { PDFViewerProps } from "@/interface/components/pageExplorer.interface";
import {
  usePdfLoader,
  useSectionManager,
  useHoverManager,
  usePageInteractions,
  useLayoutManager,
} from "@/hooks/PDFExplorer/usePDFViewer";
import Filter from "@/components/Filter";
import { useRouter } from "next/router";
import { baseUrl } from "@/utils/utils";
import * as pdfjsLib from "pdfjs-dist";
import { setPageDimensionState } from "@/redux/pageDimension/pageDimensionSlice";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { ChevronLeft, PanelLeftClose } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PageDimensions {
  width: number;
  height: number;
}

const PageExplorer: React.FC<PDFViewerProps> = ({
  colSpan,
  id,
  handleMouseHover,
  mouseHover,
  hoverPageNumber,
  handleHoverChange,
  onCollapsePanel,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageDimensions, setPageDimensions] = useState<PageDimensions | null>(
    null,
  );
  const { selectedDocuments, activeDocument, selectedProject } = useSelector(
    (state: RootState) => state.projectDocuments,
  );
  const { hiddenSections, hiddenSubsections } = useSelector(
    (state: RootState) => state.discovery,
  );
  const { sections, status } = useSelector(
    (state: RootState) => state.documents,
  );

  const { pdfUrl, isLoading, setIsLoading, options } = usePdfLoader(
    activeDocument,
    selectedDocuments,
  );

  const {
    activeSectionIndex,
    setActiveSectionIndex,
    expandedSections,
    toggleSection,
  } = useSectionManager(id, activeDocument);

  const {
    hoveredSectionIndex,
    hoveredButtonIndex,
    initialHoverOccurred,
    setHoveredButtonIndex,
    handleSectionMouseEnter,
    handleSectionMouseLeave,
    isActivating,
  } = useHoverManager(activeDocument);

  const { handlePageClick, handleContainerClick } = usePageInteractions(
    activeDocument,
    selectedProject,
    containerRef
  );

  const { initialPagesToShow, pageWidth, setPageWidth, truncateFileName } =
    useLayoutManager(colSpan);

  const onPageLoadSuccess = useCallback(() => {
    setPageWidth(window.innerWidth);
  }, [setPageWidth]);

  const onDocumentLoadSuccess = useCallback(() => {
    setIsLoading(false);
  }, [setIsLoading]);
  const { pathname } = useRouter();

  const elementSectionName = React.useMemo(() => {
    return (
      (sections?.[activeDocument?.id] &&
        sections[activeDocument?.id]?.map((section: any) => ({
          name: section.index,
          subsections:
            section.subheadings?.map((sub: { title: any }) => sub.title) || [],
        }))) ||
      []
    );
  }, [sections, activeDocument?.id]);

  const documentName = React.useMemo(() => {
    return pathname.includes("/workspace/")
      ? ""
      : activeDocument?.name || "Document Name";
  }, [pathname, activeDocument]);

  const renderPages = useCallback(
    (start: number, end: number, subtitle: boolean, expanded: boolean) => {
      const pagesToShow = expanded
        ? end
        : Math.min(end, start + initialPagesToShow - 1);
      const pages = [];

      for (let pageNumber = start; pageNumber <= pagesToShow; pageNumber++) {
        pages.push(
          <SectionPage
            key={`page-${pageNumber}`}
            pageNumber={pageNumber}
            expanded={expanded}
            activeDocument={activeDocument}
            pageWidth={pageWidth}
            subtitle={subtitle}
            hoverPageNumber={hoverPageNumber}
            initialHoverOccurred={initialHoverOccurred}
            handleHoverChange={handleHoverChange}
            handlePageClick={handlePageClick}
            onPageLoadSuccess={onPageLoadSuccess}
          />,
        );
      }

      return pages;
    },
    [
      activeDocument,
      pageWidth,
      hoverPageNumber,
      initialHoverOccurred,
      initialPagesToShow,
      handlePageClick,
    ],
  );

  //Effects

  useEffect(() => {
    calculatePageDimensions();
  }, [activeDocument?.id, hoverPageNumber]);

  const calculatePageDimensions = async () => {
    try {
      const url = `${baseUrl(activeDocument?.url)}/Processing/viewer/page_${hoverPageNumber}.pdf`;
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });

      setPageDimensions(viewport);
      dispatch(setPageDimensionState(viewport));
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    if (mouseHover) {
      handleMouseHover(hoverPageNumber);
    }
  }, [hoverPageNumber, mouseHover, handleMouseHover]);

  return (
    <div
      onClick={handleContainerClick}
      className="flex flex-col h-full overflow-hidden"
    >
      <div className={`sticky top-0 z-40 bg-transparent w-full flex items-center justify-end bg-white border-b-2 px-2 pb-1 ${activeDocument.lockedPage > 0 ? "border-[#0026732E]" : "border-[#EAF0FC]"}`}>
        <Filter
          page="discovery"
          documentName={documentName}
          elementSectionName={elementSectionName}
          sections={sections[id] || []}
        />
        <div className="h-5 w-[2px] rounded-full bg-[#eaf0fc]" />
        {onCollapsePanel && (
          <button 
          onClick={onCollapsePanel}
          className="ml-2 p-1  transition-colors group"
          title="Collapse panel"
          disabled={activeDocument.lockedPage > 0}
        >
          <PanelLeftClose className="h-5 w-5 text-[#4e5971] group-hover:text-[#004CE6]" />
        </button>
        )}
      </div>

      <div 
        ref={containerRef}
        className="w-full flex-1 overflow-y-auto pb-[200px] scrollbar-hide"
      >
        {status === "loading" && !selectedProject?.isSearched ? (
          <PageExplorerSkeleton />
        ) : !sections?.[id] ? (
          <div className="flex flex-col justify-center items-center gap-2 w-full h-full">
            <label className="mb-2">
              <Image
                src={NoDocument}
                alt="No Elements Available"
                priority
                className="max-w-full h-auto"
              />
            </label>
            <p className="text-[#4e5971] text-base text-center font-normal leading-6">
              No sections available
            </p>
          </div>
        ) : sections[id]?.length === 0 ||
          !sections[id]?.some(
            (section: { index: string }) =>
              !hiddenSections.includes(section.index),
          ) ? (
          <div className="flex flex-col justify-center items-center gap-2 w-full h-full">
            <label className="mb-2">
              <Image
                src={NoDocument}
                alt="No Elements Available"
                priority
                className="max-w-full h-auto"
              />
            </label>
            <p className="text-[#4e5971] text-base text-center font-normal leading-6">
              Please remove filters to view sections
            </p>
          </div>
        ) : (
          <div className="w-full p-2">
            {sections[id].map((section: any, index: number) => {
              if (!section?.index) return null; // Safety check for malformed section data

              const isSectionHidden = hiddenSections.includes(section.index);
              const hasSubsections =
                Array.isArray(section.subheadings) &&
                section.subheadings.length > 0;

              if (isSectionHidden) return null;

              return (
                <SectionCard
                  key={`section-${section.index}-${index}`}
                  section={section}
                  index={index}
                  expandedSections={expandedSections}
                  hasSubsections={hasSubsections}
                  hoveredSectionIndex={hoveredSectionIndex}
                  activeDocument={activeDocument}
                  handleSectionHoverEnter={(index) =>
                    handleSectionMouseEnter?.(index, setActiveSectionIndex)
                  }
                  handleSectionHoverLeave={() =>
                    handleSectionMouseLeave?.(
                      index,
                      expandedSections,
                      setActiveSectionIndex,
                      handleHoverChange,
                    )
                  }
                  toggleSection={toggleSection}
                  hoveredButtonIndex={hoveredButtonIndex}
                  setHoveredButtonIndex={setHoveredButtonIndex}
                  activeSectionIndex={activeSectionIndex}
                  initialPagesToShow={initialPagesToShow}
                  truncateFileName={truncateFileName}
                  renderPages={renderPages}
                  hiddenSubsections={hiddenSubsections}
                  isActivating={isActivating}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(PageExplorer);
