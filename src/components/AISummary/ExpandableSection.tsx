import React, { useState, useRef, useEffect } from "react";
import {
  Document,
  ExpandedContent,
} from "@/interface/components/AISummary.interface";
import ToolBar from "@/components/ToolBar";
import styles from "@/styles/AskAimodal.module.scss";

interface ExpandedSectionProps {
  document: Document;
  onAskAI: (content: ExpandedContent) => void;
  activeSection: string | null;
  setActiveSection: (heading: string | null) => void;
}

export const ExpandedSection: React.FC<ExpandedSectionProps> = ({
  document,
  onAskAI,
  activeSection,
  setActiveSection,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const expandedContentRef = useRef<HTMLDivElement>(null);
  const isExpanded = activeSection === document.Heading;
  console.log('Dpcument', document)

  useEffect(() => {
    const content = contentRef.current;
    const expandedContent = expandedContentRef.current;

    if (!content) return;

    if (isExpanded && expandedContent) {
      const height = expandedContent.scrollHeight;
      content.style.height = `${height}px`;
    } else {
      const initialList = content.querySelector(`.${styles.initialContent}`);
      const height = initialList ? initialList.scrollHeight : 0;
      content.style.height = `${height}px`;
    }
  }, [isExpanded]);

  const handleTransitionEnd = () => {
    if (isExpanded && contentRef.current) {
      contentRef.current.style.height = "auto";
    }
  };

  const getSubSectionContent = () =>
    document.subheadings
      .map(
        (section) =>
          `${section.title}\n${section.summary.map((s) => `• ${s}`).join("\n")}`,
      )
      .join("\n\n");

  const getExpandedContent = (): ExpandedContent => ({
    tableHead: document.Heading,
    content: document.subheadings.map((section) => ({
      heading: section.title,
      points: section.summary.map((s) => `• ${s}`),
    })),
  });

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.toolbar}`)) return;

    if (contentRef.current && isExpanded) {
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
      contentRef.current.offsetHeight;
      const initialList = contentRef.current.querySelector(
        `.${styles.initialContent}`,
      );
      const height = initialList ? initialList.scrollHeight : 0;
      contentRef.current.style.height = `${height}px`;
    }

    setActiveSection(isExpanded ? null : document.Heading);
  };

  return (
    <div
      className={`
        ${styles.AISummary} 
        cursor-pointer flex flex-col p-2 gap-1 border-1 border-transparent
        transition-all duration-200 ease-in rounded
        ${isExpanded ? "bg-[#fbfdff]" : ""}
      `}
      onClick={handleClick}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-[#001742] text-base font-semibold leading-6 m-0">
          {document.Heading}
        </h3>
        {/* {isExpanded && (
          <ToolBar
            chunks
            highlightViewer
            isSearch={false}
            contentToCopy={getSubSectionContent()}
            onAddToWorkspace={() => {}}
            onAskAI={() => onAskAI(getExpandedContent())}
            categoryCount={0}
            onColorSelect={() => {}}
            askAI={false}
            isChart={false}
            isTextChunk={false}
            isGraphChunk={false}
            tableTitle=""
            workspaceElement
          />
        )} */}
      </div>

      <div
        ref={contentRef}
        className="relative h-auto overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        onTransitionEnd={handleTransitionEnd}
      >
        {!isExpanded ? (
          <ul className="pl-2.5 opacity-100 transition-opacity duration-200 ease-in-out m-0">
            {document.summary.map((point, index) => (
              <li
                key={index}
                className="text-[#4e5971] text-sm font-normal leading-5 mb-1"
              >
                • {point}
              </li>
            ))}
          </ul>
        ) : (
          <div
            ref={expandedContentRef}
            className={`w-full transition-all duration-300 ease-in m-0
              ${isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2.5"}`}
          >
            {document.subheadings.map((section, index) => (
              <div
                key={index}
                className="p-2 rounded-lg transition-all duration-200 ease-in border-0
                  hover:rounded hover:border hover:border-[#eaf0fc] hover:bg-white hover:shadow-[1px_2px_4px_0px_rgba(0,76,230,0.05)]"
              >
                <h4 className="text-[#001742] text-base font-semibold leading-6 mb-1">
                  {section.title}
                </h4>
                <ul className="pl-5 m-0">
                  {section.summary.map((point, pointIndex) => (
                    <li
                      key={pointIndex}
                      className="text-[#4e5971] text-sm font-normal leading-5 m-0"
                    >
                      • {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandedSection;
