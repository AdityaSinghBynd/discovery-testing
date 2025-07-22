import React, { useEffect } from "react";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import Image from "next/image";
import HoverPinIcon from "../../../../public/images/lock-open.svg";
import PinIcon from "../../../../public/images/lock.svg";
import { baseUrl } from "@/utils/utils";

interface PageProps {
  pageNumber: number;
  expanded: boolean;
  activeDocument: any;
  pageWidth: number;
  subtitle: boolean;
  hoverPageNumber: number;
  initialHoverOccurred: boolean;
  handleHoverChange: (pageNumber: number) => void;
  handlePageClick: (pageNumber: number) => void;
  onPageLoadSuccess: () => void;
}

type ImageCacheType = Map<string, Map<number, boolean>>;
const imageLoadCache: ImageCacheType = new Map();

let lastDocumentId: string | null = null;

const SectionPage: React.FC<PageProps> = ({
  pageNumber,
  expanded,
  activeDocument,
  pageWidth,
  subtitle,
  hoverPageNumber,
  initialHoverOccurred,
  handleHoverChange,
  handlePageClick,
  onPageLoadSuccess,
}) => {
  const documentId = activeDocument?.id || activeDocument?.url || '';
  
  if (lastDocumentId && documentId !== lastDocumentId) {
    imageLoadCache.clear();
  }
  lastDocumentId = documentId;
  
  let documentCache = imageLoadCache.get(documentId);
  if (!documentCache) {
    documentCache = new Map<number, boolean>();
    imageLoadCache.set(documentId, documentCache);
  }
  
  const initialLoadState = documentCache.get(pageNumber) || false;
  const [imageLoaded, setImageLoaded] = React.useState(initialLoadState);
  
  const isPinned = activeDocument.lockedPage === pageNumber;
  const isSelected = activeDocument.lockedPage === pageNumber;
  const isHovered = hoverPageNumber === pageNumber || isSelected;
  const isAnyPageSelected = activeDocument.lockedPage !== -1;

  useEffect(() => {
    if (imageLoaded && documentCache) {
      documentCache.set(pageNumber, true);
      onPageLoadSuccess();
    }
    
    if (imageLoadCache.size > 10) { // Keep caches for up to 10 documents
      const keys = Array.from(imageLoadCache.keys());
      if (keys.length > 10 && keys[0] !== documentId) {
        imageLoadCache.delete(keys[0]);
      }
    }
  }, [imageLoaded, documentId, documentCache, pageNumber, onPageLoadSuccess]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newPage = isPinned ? -1 : pageNumber;
    handlePageClick(newPage);
  };

  const containerClasses = `relative flex justify-center items-center
    transition-[border-top,box-shadow] duration-300 ease-in-out group
    ${!isAnyPageSelected ? "cursor-pointer hover:rounded-[2px] hover:shadow-[0_-3px_0_0_blue]" : ""}
    ${isSelected ? "rounded-[2px] shadow-[0_-3px_0_0_blue] opacity-100 z-10 cursor-pointer" : ""}
    ${isHovered && !isAnyPageSelected ? "animate-slideRight" : ""}
    ${isAnyPageSelected && !isSelected ? "cursor-default pointer-events-none" : ""}`;

  return (
    <LazyLoadComponent key={`page-${pageNumber}`}>
      <div className="flex justify-center items-center">
        <div
          className={containerClasses}
          data-page-number={pageNumber}
          onMouseEnter={() =>
            !isAnyPageSelected &&
            initialHoverOccurred &&
            handleHoverChange(pageNumber)
          }
          onMouseLeave={() =>
            !isAnyPageSelected &&
            initialHoverOccurred &&
            handleHoverChange(pageNumber)
          }
          onClick={handleClick}
        >
          {activeDocument?.url && (
            <Image
              src={`${baseUrl(activeDocument?.url)}/Processed/thumbnails/page_${pageNumber}.jpg`}
              alt={`Page ${pageNumber}`}
              width={Math.max(pageWidth * (subtitle ? 0.02 : 0.01), 40)}
              height={Math.max(pageWidth * (subtitle ? 0.02 : 0.01), 40)}
              className={`m-0 select-none transition-all duration-500 ease-in-out ${
                imageLoaded ? 'opacity-100 blur-none' : 'opacity-0 blur-sm'
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
              onLoad={() => {
                setImageLoaded(true);
              }}
              {...(isPinned 
                ? { priority: true } 
                : { loading: 'lazy' }
              )}
              data-page-number={pageNumber}
            />
          )}
          {!isAnyPageSelected && (
            <Image
              src={HoverPinIcon}
              alt="Hover Pin"
              className="rounded select-none bg-white p-0.5 z-[5] absolute top-3 left-[7px] w-[27px] h-[27px] shadow-[1px_2px_4px_0px_rgba(0,76,230,0.05)] hidden group-hover:block"
            />
          )}
          {isPinned && (
            <Image
              src={PinIcon}
              alt="Pinned"
              className="rounded select-none bg-white p-0.5 z-[5] absolute top-3 left-[7px] w-[27px] h-[27px] shadow-[1px_2px_4px_0px_rgba(0,76,230,0.05)]"
            />
          )}
        </div>
      </div>
    </LazyLoadComponent>
  );
};

export default React.memo(SectionPage);
