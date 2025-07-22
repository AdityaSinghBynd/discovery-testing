import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectDiscoveryHiddenSections } from "@/redux/filter/discovery/discoverySelectors";
import { selectWorkspaceHiddenSections } from "@/redux/filter/workspace/workspaceSelectors";
import {
  toggleWorkspaceSectionVisibility,
  setAllWorkspaceSections,
  resetWorkspaceFilters,
  toggleAllWorkspaceSections,
} from "@/redux/filter/workspace/workspaceSlice";
import {
  toggleDiscoverySectionVisibility,
  toggleDiscoverySubsectionVisibility,
  setAllDiscoverySections,
  resetDiscoveryFilters,
  toggleAllDiscoverySections,
} from "@/redux/filter/discovery/discoverySlice";
import {
  FilterComponentProps,
  FilterContainerState,
  SectionData,
} from "@/interface/components/filter.interface";
import { RootState } from "@/store/store";
import { truncateText } from "@/utils/utils";
import { ListFilterIcon } from "lucide-react";

const FilterComponent: React.FC<FilterComponentProps> = ({
  documentName,
  elementSectionName = [],
  page,
  sections,
}) => {
  const [filterContainerState, setFilterContainerState] =
    useState<FilterContainerState>("closed");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { selectedProject, selectedDocuments, activeDocument } = useSelector(
    (state: RootState) => state.projectDocuments,
  );

  const handleClose = (e?: React.MouseEvent | MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (filterContainerState === "open" || filterContainerState === "opening") {
      setFilterContainerState("closing");
      setTimeout(() => setFilterContainerState("closed"), 500);
    }
  };

  const toggleFilterContainer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeDocument?.lockedPage > 0) return;
    
    if (
      filterContainerState === "closed" ||
      filterContainerState === "closing"
    ) {
      setFilterContainerState("opening");
    } else {
      handleClose();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterContainerState !== "open" &&
        filterContainerState !== "opening"
      ) {
        return;
      }

      const target = event.target as Node;
      const isOutsideFilter = !filterRef.current?.contains(target);
      const isOutsideButton = !filterButtonRef.current?.contains(target);

      if (isOutsideFilter && isOutsideButton) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterContainerState]);

  const hiddenSections = useSelector(
    page === "discovery"
      ? selectDiscoveryHiddenSections
      : selectWorkspaceHiddenSections,
  );

  const isNewFormat =
    elementSectionName?.[0] != null &&
    typeof elementSectionName[0] === "object" &&
    (elementSectionName[0] as any).name != null;

  const handleStopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const handleSectionToggle = (sectionName: string) => {
    if (page === "discovery") {
      dispatch(toggleDiscoverySectionVisibility(sectionName));
    } else {
      dispatch(toggleWorkspaceSectionVisibility(sectionName));
    }
  };

  const handleSubsectionToggle = (
    section: string,
    subsection: string,
    totalSubsections: number,
    e: React.MouseEvent,
  ) => {
    handleStopPropagation(e);
    if (page === "discovery") {
      dispatch(
        toggleDiscoverySubsectionVisibility({
          section,
          subsection,
          totalSubsections,
        }),
      );
    }
  };

  const handleExpand = (
    sectionName: string,
    hasSubsections: boolean,
    e: React.MouseEvent,
  ) => {
    handleStopPropagation(e);
    if (!hasSubsections) return;

    setExpandedSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((name) => name !== sectionName)
        : [...prev, sectionName],
    );
  };

  const closeFilter = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setFilterContainerState("closed");
    if (page === "discovery") {
      dispatch(resetDiscoveryFilters());
    } else {
      dispatch(resetWorkspaceFilters());
    }
  };

  useEffect(() => {
    if (elementSectionName?.length > 0) {
      const sectionNames = isNewFormat
        ? (elementSectionName as SectionData[]).map((section) => section.name)
        : (elementSectionName as string[]);

      if (page === "discovery") {
        dispatch(setAllDiscoverySections(sectionNames));
      } else {
        dispatch(setAllWorkspaceSections(sectionNames));
      }
    }
  }, [elementSectionName, dispatch, isNewFormat, page]);

  return (
    <div
      ref={filterButtonRef}
      className={`flex items-center rounded py-1 px-2 gap-1.5 cursor-pointer relative`}
      onClick={toggleFilterContainer}
    >
      <div className="group flex gap-1 items-center justify-start">
        <ListFilterIcon className={`h-5 w-5 group-hover:text-[#004CE6] ${filterContainerState === "open" ? "text-[#004CE6]" : "text-[#4E5971]"}`} />
        {selectedProject?.tabSelected === "Discovery" ? (
          <p className="text-md text-[#4E5971]">All Sections</p>
        ) : (
          <p className="text-md text-[#4E5971]">All Documents</p>
        )}
      </div>

      {filterContainerState !== "closed" && (
        <div
          ref={filterRef}
          className={`absolute w-[340px] left-full -translate-x-full top-[calc(100%+8px)] 
            bg-white border border-1  !border-[#EAF0FC] rounded p-2.5 gap-2 shadow-sm z-50 
            transition-all duration-300 ease-in-out
            ${
              filterContainerState === "opening"
                ? "animate-slideDown opacity-100 translate-y-0"
                : filterContainerState === "closing"
                  ? "animate-slideUp opacity-0 -translate-y-2"
                  : "opacity-100 translate-y-0"
            }`}
          onClick={(e) => e.stopPropagation()}
          onAnimationEnd={() => {
            if (filterContainerState === "opening") {
              setFilterContainerState("open");
            }
          }}
        >
          <div className="flex justify-between px-1 gap-1 items-center">
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(
                  page === "discovery"
                    ? toggleAllDiscoverySections()
                    : toggleAllWorkspaceSections(),
                );
              }}
            >
              <input
                type="checkbox"
                checked={hiddenSections.length === 0}
                onChange={() => {}}
                className="rounded border-gray-300 w-4 h-4 cursor-pointer accent-blue-500 hover:accent-blue-700"
              />
              {selectedProject?.tabSelected === "Discovery" ? (
                <label className="text-sm cursor-pointer">All Sections</label>
              ) : (
                <label className="text-sm cursor-pointer">All Documents</label>
              )}
            </div>
          </div>

          <ul className="flex flex-col p-0 m-0 overflow-y-auto max-h-[280px] scrollbar-hide">
            {elementSectionName.map((section, index) => {
              const sectionName =
                typeof section === "string" ? section : section?.name || "";
              const isHidden = hiddenSections.includes(sectionName);

              return (
                <li key={index} className="list-none">
                  <div
                    className="flex justify-between w-full items-center py-2 px-1 transition-colors rounded hover:bg-[#f7f9fe] cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSectionToggle(sectionName);
                    }}
                  >
                    <div className="flex justify-start items-center gap-1">
                      <input
                        type="checkbox"
                        checked={!isHidden}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSectionToggle(sectionName);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 w-4 h-4 mr-1 cursor-pointer opacity-70 accent-blue-500 hover:accent-blue-700"
                      />
                      <p className="m-0 text-gray-600 text-sm font-medium">
                        {truncateText(sectionName, 28)}
                      </p>
                    </div>
                    {selectedProject?.tabSelected === "Discovery" && (
                      <p className="text-[#4E5971] text-[12px]">
                        {sections[index].startPage}-{sections[index].endPage}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterComponent;
