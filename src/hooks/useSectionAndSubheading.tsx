import { RootState } from "@/store/store";
import { ChevronRight } from "lucide-react";
import { useCallback } from "react";
import { useSelector } from "react-redux";

// Format section subheading helper
const formatSectionSubheading = (sectionIndex: string, subheadingTitle: string): React.ReactNode => (
  <div className="flex items-center">
    {sectionIndex} <ChevronRight className="h-5 w-5 text-[#9babc7]" />{" "}
    {subheadingTitle}
  </div>
);

export const useSectionAndSubheading = () => {
  const { activeDocument } = useSelector((state: RootState) => state.projectDocuments);
  const sections = useSelector((state: RootState) => state.documents.sections);

  const getSectionIndex = useCallback(
    (pageNum: number, docId?: string): string => {
      const documentId = docId || activeDocument?.id;
      const documentSections = sections[documentId];

      if (!Array.isArray(documentSections)) {
        return "Unknown Section";
      }

      for (const section of documentSections) {
        if (pageNum >= section.startPage && pageNum <= section.endPage) {
          return section.index;
        }
      }
      return "Unknown Section";
    },
    [sections, activeDocument],
  );

  const getSectionAndSubheading = useCallback(
    (index: number, pageNum: number, docId?: string): React.ReactNode => {
      const documentId = docId || activeDocument?.id;
      const documentSections = sections[documentId];

      if (!Array.isArray(documentSections)) {
        return formatSectionSubheading("Unknown Section", "Unknown Subheading");
      }

      for (const section of documentSections) {
        if (pageNum >= section.startPage && pageNum <= section.endPage) {
          if (!Array.isArray(section.subheadings)) {
            return formatSectionSubheading(section.index, "Unknown Subheading");
          }

          for (const subheading of section.subheadings) {
            if (
              pageNum >= subheading.startPage &&
              pageNum <= subheading.endPage
            ) {
              return formatSectionSubheading(section.index, subheading.title);
            }
          }
          return formatSectionSubheading(section.index, "Unknown Subheading");
        }
      }
      return formatSectionSubheading("Unknown Section", "Unknown Subheading");
    },
    [sections, activeDocument],
  );

  return { getSectionAndSubheading, getSectionIndex };
}; 