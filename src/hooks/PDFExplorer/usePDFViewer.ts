import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import debounce from "lodash/debounce";
import { fetchSections } from "@/redux/document/documentThunks";
import { updateDocument } from "@/redux/projectDocuments/projectDocumentsThunks";
import { setLocalPageLock } from "@/redux/projectDocuments/projectDocumentsSlice";
import { track } from "@amplitude/analytics-browser";

// Hook for managing PDF-related state and functionality
export const usePdfLoader = (activeDocument: any, selectedDocuments: any) => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const dispatch: AppDispatch = useDispatch();
  const { sections } = useSelector((state: RootState) => state.documents);

  useEffect(() => {
    const sectionValue = sections && sections[activeDocument.id];
    setIsLoading(true);

    const loadData = async () => {
      if (!sectionValue) {
        await dispatch(fetchSections(activeDocument.id));
      }
    };

    loadData().catch(console.error);
  }, [dispatch, activeDocument, sections]);

  const options = useMemo(
    () => ({
      cMapUrl: "cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "standard_fonts/",
      verbosity: 0,
    }),
    [],
  );

  return {
    pdfUrl,
    isLoading,
    setIsLoading,
    options,
  };
};

// Hook for managing sections and their states
export const useSectionManager = (id: string, activeDocument: any) => {
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(
    null,
  );
  const [expandedSections, setExpandedSection] = useState<number | null>(null);
  const { sections } = useSelector((state: RootState) => state.documents);

  // Update active section based on locked page
  useEffect(() => {
    if (activeDocument.lockedPage !== -1 && sections && sections[id]) {
      const sectionIndex = sections[id].findIndex(
        (section: any) =>
          activeDocument.lockedPage >= section.startPage &&
          activeDocument.lockedPage <= section.endPage,
      );
      if (
        sectionIndex !== -1 &&
        sections[id][sectionIndex].subheadings?.length > 0
      ) {
        setExpandedSection(sectionIndex);
        setActiveSectionIndex(sectionIndex);
      }
    } else {
      // Reset activeSectionIndex when no page is locked
      setActiveSectionIndex(null);
    }
  }, [activeDocument.lockedPage, sections, id]);

  const toggleSection = (index: number) => {
    if (
      sections &&
      sections[id] &&
      sections[id][index].subheadings &&
      sections[id][index].subheadings.length > 0
    ) {
      setExpandedSection((prevExpandedSection) =>
        prevExpandedSection === index ? null : index,
      );
    }
  };

  return {
    activeSectionIndex,
    setActiveSectionIndex,
    expandedSections,
    toggleSection,
  };
};

export const useHoverManager = (activeDocument: any) => {
  const [hoveredSectionIndex, setHoveredSectionIndex] = useState<number | null>(
    null,
  );
  const [hoveredSubsectionIndex, setHoveredSubsectionIndex] = useState<
    number | null
  >(null);
  const [hoveredButtonIndex, setHoveredButtonIndex] = useState<number | null>(
    null,
  );
  const [initialHoverOccurred, setInitialHoverOccurred] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeDocument.lockedPage === -1) {
      setIsActivating(false);
    }
  }, [activeDocument.lockedPage]);

  useEffect(() => {
    return () => {
      setIsActivating(false);
      setHoveredSectionIndex(null);
      setHoveredSubsectionIndex(null);
      setHoveredButtonIndex(null);
      setInitialHoverOccurred(false);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleSectionMouseEnter = useCallback(
    (index: number, setActiveSectionIndex: (index: number | null) => void) => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      setHoveredSectionIndex(index);

      if (activeDocument.lockedPage === -1 && !isActivating) {
        setIsActivating(true);
        setActiveSectionIndex(index);

        setTimeout(() => {
          setIsActivating(false);
        }, 500);
      }

      if (!initialHoverOccurred) {
        setInitialHoverOccurred(true);
      }
    },
    [activeDocument.lockedPage, isActivating],
  );

  const handleSectionMouseLeave = useCallback(
    (
      index: number,
      expandedSections: number | null,
      setActiveSectionIndex: (index: number | null) => void,
      handleHoverChange: (pageNumber: number) => void,
    ) => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      hoverTimeoutRef.current = setTimeout(() => {
        requestAnimationFrame(() => {
          setHoveredSectionIndex((currentIndex) => {
            if (currentIndex === index) {
              if (activeDocument.lockedPage === -1) {
                setActiveSectionIndex(null);
              }
              handleHoverChange(0);
              return null;
            }
            return currentIndex;
          });
        });
      }, 1000);
    },
    [activeDocument.lockedPage],
  );

  return {
    hoveredSectionIndex,
    hoveredSubsectionIndex,
    hoveredButtonIndex,
    initialHoverOccurred,
    isActivating,
    setHoveredSectionIndex,
    setHoveredSubsectionIndex,
    setHoveredButtonIndex,
    handleSectionMouseEnter,
    handleSectionMouseLeave,
  };
};

// Hook for managing page interactions
export const usePageInteractions = (
  activeDocument: any,
  selectedProject: any,
  containerRef?: React.RefObject<HTMLDivElement>
) => {
  const dispatch = useDispatch<AppDispatch>();
  const { sections } = useSelector((state: RootState) => state.documents);

  const debounceDispatch = useRef(
    debounce((documentId: string, projectId: string, lockedPage: number) => {
      dispatch(
        updateDocument({
          documentId,
          projectId,
          payload: {
            lockedPage,
            isActive: true,
          },
        }),
      );
    }, 500),
  ).current;

  const scrollToPage = useCallback((pageNumber: number) => {
    if (!containerRef?.current) return;

    const container = containerRef.current;
    if (!container) return;

    const pageElements = container.querySelectorAll(`[data-page-number="${pageNumber}"]`);
    if (pageElements.length === 0) return;

    const pageElement = pageElements[0];

    const pageContainer = pageElement.closest('div[class*="relative flex justify-center"]') || pageElement;

    const containerRect = container.getBoundingClientRect();
    const elementRect = pageContainer.getBoundingClientRect();

    const containerHeight = containerRect.height;
    const elementTop = elementRect.top - containerRect.top + container.scrollTop;
    const elementHeight = elementRect.height;

    const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2);

    pageContainer.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-70', 'transition-all', 'duration-500');

    container.scrollTo({
      top: scrollPosition,
      behavior: 'smooth'
    });

    return () => {
      pageContainer.classList.remove(
        'ring-4', 'ring-blue-500', 'ring-opacity-70',
        'ring-2', 'ring-blue-300', 'ring-opacity-50',
        'transition-all', 'duration-500'
      );
    };
  }, [containerRef]);

  const handlePageClick = useCallback(
    (pageNumber: number) => {
      const newLockedPage =
        activeDocument?.lockedPage === pageNumber ? -1 : pageNumber;

      if (newLockedPage === -1 && containerRef?.current) {
        const highlightedElements = containerRef.current.querySelectorAll(
          '.ring-2, .ring-4, [class*="ring-blue"]'
        );
        highlightedElements.forEach(el => {
          el.classList.remove(
            'ring-4', 'ring-blue-500', 'ring-opacity-70',
            'ring-2', 'ring-blue-300', 'ring-opacity-50',
            'transition-all', 'duration-500'
          );
        });
      }

      if (newLockedPage !== -1) {
        if (containerRef?.current && sections?.[activeDocument?.id]) {
          const sectionsData = sections[activeDocument?.id];
          const sectionIndex = sectionsData.findIndex(
            (section: any) =>
              pageNumber >= section.startPage &&
              pageNumber <= section.endPage
          );

          if (sectionIndex !== -1) {
            const container = containerRef.current;
            if (container) {
              const sectionElement = container.querySelector(`#section-${sectionIndex}`);

              if (sectionElement) {
                const computedStyle = getComputedStyle(sectionElement);
                const isCollapsed = computedStyle.maxHeight !== 'none' &&
                  computedStyle.maxHeight !== 'max-content' &&
                  computedStyle.maxHeight !== 'fit-content';

                if (isCollapsed) {
                  const toggleButtons = Array.from(container.querySelectorAll('button'));
                  const sectionToggleButton = toggleButtons.find(btn => {
                    const imgElement = btn.querySelector('img');
                    return imgElement &&
                      (imgElement.alt === "Show More" || imgElement.alt === "Show Less") &&
                      btn.closest(`#section-${sectionIndex}`) === null &&
                      btn.getBoundingClientRect().top > sectionElement.getBoundingClientRect().bottom;
                  });

                  if (sectionToggleButton) {
                    sectionToggleButton.click();
                  } else {
                    scrollToPage(pageNumber);
                  }
                } else {
                  scrollToPage(pageNumber);
                }
              } else {
                scrollToPage(pageNumber);
              }
            }
          } else {
            scrollToPage(pageNumber);
          }
        } else {
          scrollToPage(pageNumber);
        }
      }

      track("page_click", { documentId: activeDocument?.id, pageNumber, documentName: activeDocument?.name });

      dispatch(
        setLocalPageLock({
          documentId: activeDocument?.id,
          lockedPage: newLockedPage,
          isActive: true,
        }),
      );

      debounceDispatch(
        activeDocument?.id,
        selectedProject?.id as string,
        newLockedPage,
      );

      if (newLockedPage !== -1) {
        setTimeout(() => {
          scrollToPage(pageNumber);
        }, 400);
      }
    },
    [
      activeDocument?.id,
      activeDocument?.lockedPage,
      selectedProject?.id,
      debounceDispatch,
      scrollToPage,
      sections,
      containerRef
    ],
  );

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".pdfPageContainer")) {
        dispatch(
          setLocalPageLock({
            documentId: activeDocument?.id,
            lockedPage: -1,
            isActive: true,
          }),
        );

        debounceDispatch(activeDocument?.id, selectedProject?.id as string, -1);
      }
    },
    [activeDocument?.id, selectedProject?.id, debounceDispatch],
  );

  return {
    handlePageClick,
    handleContainerClick,
  };
};

// Hook for managing layout and responsiveness
export const useLayoutManager = (colSpan: string) => {
  const [gridClass, setGridClass] = useState(
    "grid grid-cols-8 gap-auto bg-transparent",
  );
  const [initialPagesToShow, setInitialPagesToShow] = useState(8);
  const [pageWidth, setPageWidth] = useState(0);

  useEffect(() => {
    setGridClass(`grid ${colSpan} gap-auto bg-transparent auto-rows-fr`);
    setInitialPagesToShow(parseInt(colSpan.slice(-1)));
  }, [colSpan]);

  const truncateFileName = (heading: string, initialPagesToShow: number) => {
    let maxLength;

    if (initialPagesToShow >= 8) {
      maxLength = 45;
    } else if (initialPagesToShow >= 6) {
      maxLength = 32;
    } else if (initialPagesToShow >= 4) {
      maxLength = 25;
    } else {
      maxLength = 30;
    }
    const isTruncated = heading.length > maxLength;
    const truncatedText = isTruncated
      ? `${heading.slice(0, maxLength)}...`
      : heading;

    return { truncatedText, isTruncated };
  };

  return {
    gridClass,
    initialPagesToShow,
    pageWidth,
    setPageWidth,
    truncateFileName,
  };
};
