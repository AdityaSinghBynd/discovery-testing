import React from "react";
import Image from "next/image";
import ChevronUpWhiteIcon from "../../../../public/images/chevron-up-white.svg";
import ChevronDownWhiteIcon from "../../../../public/images/chevron-down-white.svg";
import ChevronDownIcon from "../../../../public/images/chevron-down.svg";
import { getBorderColor } from "@/utils/utils";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@/components/ui/tooltip";

interface SectionCardProps {
  section: any;
  index: number;
  expandedSections: number | null;
  hasSubsections: boolean;
  hoveredSectionIndex: number | null;
  activeDocument: any;
  handleSectionHoverEnter: (index: number) => void;
  handleSectionHoverLeave: () => void;
  toggleSection: (index: number) => void;
  hoveredButtonIndex: number | null;
  setHoveredButtonIndex: (index: number | null) => void;
  activeSectionIndex: number | null;
  initialPagesToShow: number;
  truncateFileName: (
    heading: string,
    initialPagesToShow: number,
  ) => { truncatedText: string; isTruncated: boolean };
  renderPages: (
    start: number,
    end: number,
    subtitle: boolean,
    expanded: boolean,
  ) => React.ReactNode;
  hiddenSubsections: any;
  isActivating: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  index,
  expandedSections,
  hasSubsections,
  hoveredSectionIndex,
  activeDocument,
  handleSectionHoverEnter,
  handleSectionHoverLeave,
  toggleSection,
  hoveredButtonIndex,
  setHoveredButtonIndex,
  activeSectionIndex,
  initialPagesToShow,
  truncateFileName,
  renderPages,
  hiddenSubsections,
  isActivating,
}) => {
  const isExpanded = expandedSections === index || activeSectionIndex === index;
  const { truncatedText: truncatedHeading, isTruncated: isHeadingTruncated } =
    truncateFileName(section.index, initialPagesToShow);
  const showExpandButton =
    section.endPage > section.startPage + initialPagesToShow - 1 &&
    hasSubsections;

  return (
    <>
      <div
        id={`section-${index}`}
        className={`p-2 w-full border-[1.5px] border-[#EAF0FC] overflow-hidden rounded-[12px]
        transition-all duration-500 ease-in-out
        ${index !== 0 ? "mt-3" : "mt-3"}
        ${activeDocument.lockedPage === -1 ? "hover:shadow-[0px_4px_8px_0px_rgba(0,76,230,0.05)]" : ""} 
        ${isExpanded && hasSubsections ? "bg-[#fbfdff] shadow-custom-blue" : ""} 
        ${isExpanded ? "max-h-none" : "max-h-[200px]"}
        ${hoveredSectionIndex === index && activeDocument.lockedPage === -1 ? "bg-[#fbfdff]" : ""}`}
        onMouseEnter={() =>
          activeDocument.lockedPage === -1 && handleSectionHoverEnter(index)
        }
        onMouseLeave={() =>
          activeDocument.lockedPage === -1 && handleSectionHoverLeave()
        }
      >
        <div
          className="flex items-center justify-between px-2 text-center sticky top-[5px] bg-transparent gap-1 mb-3"
          style={{
            cursor: hasSubsections ? "pointer" : "default",
          }}
          onClick={() => hasSubsections && toggleSection(index)}
        >
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h4
                    className="text-[#4e5971] text-[16px] truncate whitespace-nowrap overflow-hidden mb-0 pl-2"
                    style={{
                      borderLeft: `3px solid ${getBorderColor(index)}`,
                      marginBottom: 0,
                    }}
                  >
                    {truncatedHeading}
                  </h4>
                </TooltipTrigger>
                {isHeadingTruncated && (
                  <TooltipContent className="bg-white rounded">
                    {section.index}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-[#4e5971] text-sm">
            {section.startPage}-{section.endPage}
          </div>
        </div>
        <div
          className={`transition-opacity duration-500 ease-in-out
          ${isActivating ? "pointer-events-none opacity-70" : ""}
          ${
            hoveredSectionIndex === index ||
            (activeDocument.lockedPage !== -1 &&
              section.startPage <= activeDocument.lockedPage &&
              activeDocument.lockedPage <= section.endPage)
              ? "opacity-100"
              : "opacity-70 blur-[0.25px]"
          }
          ${activeDocument.lockedPage === -1 && hoveredSectionIndex !== index ? "pointer-events-auto" : ""}`}
        >
          {expandedSections === index && hasSubsections ? (
            section.subheadings.map((subheading: any, subIndex: any) => {
              const isSubsectionHidden = hiddenSubsections[
                section.index
              ]?.includes(subheading.title);
              const {
                truncatedText: truncatedSubheading,
                isTruncated: isSubheadingTruncated,
              } = truncateFileName(subheading.title, initialPagesToShow);

              return (
                !isSubsectionHidden && (
                  <div
                    key={`${subheading.title}-${subIndex}`}
                    className="mb-3 py-1 pl-4 bg-[#f7f9fe] rounded-[12px] transition-all duration-500 ease-in-out"
                  >
                    <div className="flex items-center justify-between pl-0 pr-2 text-center mb-2">
                      <div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <h5 className="text-[#4e5971] text-[14px] truncate whitespace-nowrap overflow-hidden m-0">
                                {truncatedSubheading}
                              </h5>
                            </TooltipTrigger>
                            {isSubheadingTruncated && (
                              <TooltipContent className="bg-white rounded">
                                {subheading.title}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="text-[#4e5971] text-sm">
                        {subheading.startPage}-{subheading.endPage}
                      </div>
                    </div>
                    <div className={`flex flex-wrap gap-4 bg-transparent`}>
                      {renderPages(
                        subheading.startPage,
                        subheading.endPage,
                        true,
                        expandedSections === index,
                      )}
                    </div>
                  </div>
                )
              );
            })
          ) : (
            <div className={`grid grid-flow-col gap-2 bg-transparent`}>
              {renderPages(
                section.startPage,
                section.endPage,
                false,
                expandedSections === index,
              )}
            </div>
          )}
        </div>
      </div>
      {showExpandButton && (
        <div className="text-center flex justify-center relative left-0">
          <button
            className={`border-none flex items-center justify-center max-w-[50px] w-full 
                  rounded-b cursor-pointer transition-all duration-300
                  ${
                    expandedSections === index || hoveredSectionIndex === index
                      ? "bg-[#004ce6] text-white"
                      : "bg-[#f5f7fb] text-[#007bff] hover:bg-[#004ce6] hover:text-white"
                  }`}
            onClick={() =>
              activeDocument.lockedPage === -1 && toggleSection(index)
            }
            disabled={activeDocument.lockedPage !== -1}
            onMouseEnter={() => setHoveredButtonIndex(index)}
            onMouseLeave={() => setHoveredButtonIndex(null)}
          >
            {expandedSections === index ? (
              <Image
                src={ChevronUpWhiteIcon}
                alt="Show Less"
                className="w-5 h-5"
              />
            ) : (
              <Image
                src={
                  activeDocument.lockedPage === -1 &&
                  (hoveredSectionIndex === index ||
                    hoveredButtonIndex === index)
                    ? ChevronDownWhiteIcon
                    : ChevronDownIcon
                }
                alt="Show More"
                className="w-5 h-5"
              />
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default React.memo(SectionCard);
