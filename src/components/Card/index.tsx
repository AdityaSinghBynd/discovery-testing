import { useState, useEffect, useRef, useCallback } from "react";
import EditProjectModal from "@/components/Modals/ProjectAction/Edit";
import DeleteProjectModal from "@/components/Modals/ProjectAction/Delete";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { MoreVertical, Trash, SquarePen } from "lucide-react";
import Link from "next/link";
import { updateDocument } from "@/redux/projectDocuments/projectDocumentsThunks";
import {
  ProjectCardProps,
  Document,
} from "@/interface/components/card.interface";
import { baseUrl, truncateText } from "@/utils/utils";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { formatDate } from "@/utils/utils";
import { setActiveDocuments } from "@/redux/projectDocuments/projectDocumentsSlice";
import router from "next/router";
import ByndLogo from '../../../public/images/ByndLogoFavicon.svg';
import { SpecialZoomLevel, Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const ImageSkeleton = () => (
  <div className="relative aspect-[3/4] overflow-hidden rounded bg-[#F0F4FD] border-1 border-[#EAF0FC]" />
);

interface ImageWithBlurProps {
  src: string;
  alt: string;
  onError?: () => void;
  onClick?: () => void;
}

const ImageWithBlur = ({ src, alt, onError, onClick }: ImageWithBlurProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  if (hasError || !src) {
    return (
      <div className="relative aspect-[3/4] overflow-hidden bg-white border-1 border-[#EAF0FC] flex flex-col gap-2 rounded items-center justify-center">
        <Image src={ByndLogo} alt="ByndLogo" width={50} height={50} />
        <span className=" text-center text-sm text-[#9babc7]">Image<br />unavailable</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden">
      {isLoading && <ImageSkeleton />}
      <Image
        src={src}
        alt={alt}
        fill
        className={`
          object-cover
          transition-all duration-300 ease-in-out
          ${isLoading ? "opacity-0" : "opacity-100"}
        `}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false}
        loading="lazy"
        onLoadingComplete={() => setIsLoading(false)}
        onError={handleError}
      />
    </div>
  );
};

// Error Fallback component
const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => (
  <div className="p-4 border border-red-200 rounded-lg">
    <p className="text-red-600">Something went wrong:</p>
    <pre className="text-sm">{error.message}</pre>
    <Button onClick={resetErrorBoundary} className="mt-2">
      Try again
    </Button>
  </div>
);

export function ProjectCard({
  project,
  onProjectClick,
  onDeleteProject,
  onEditProject,
  className = "",
}: ProjectCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const textRef = useRef<HTMLHeadingElement>(null);
  const modalTimeoutRef = useRef<NodeJS.Timeout>();
  const dispatch = useDispatch<AppDispatch>();
  const { projectDocumentList } = useSelector(
    (state: RootState) => state.projectDocuments,
  );
  const documents = projectDocumentList?.[String(project.id)] || [];

  const calculateProjectLength = (id: string): number => {
    if (projectDocumentList && projectDocumentList[id]) {
      const project = projectDocumentList[id];

      if (typeof project === "object" && project !== null) {
        return Object.keys(project).length;
      }
    }

    return 0;
  };

  // Cleanup function for modal timeout
  useEffect(() => {
    return () => {
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
      }
    };
  }, []);

  // Memoized event handlers
  const handleModalClose = useCallback((setter: (value: boolean) => void) => {
    setIsModalClosing(true);
    setter(false);
    modalTimeoutRef.current = setTimeout(() => {
      setIsModalClosing(false);
    }, 300);
  }, []);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditModalOpen(true);
  }, []);

  const handleUpdate = useCallback(
    async (name: string) => {
      try {
        const toastId = toast.loading("Updating Project Name...");
        setIsUpdating(true);
        await onEditProject(project.id, name);
        setIsEditModalOpen(false);
        toast.update(toastId, {
          render: "Project Name Updated.",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } catch (error) {
        const toastId = toast.loading("Updating Project Name...");
        console.error("Failed to update project:", error);
        toast.update(toastId, {
          render: "Oops, something went wrong",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [project.id, onEditProject],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isModalClosing) {
        setIsDeleteModalOpen(true);
      }
    },
    [isModalClosing],
  );

  const handleDocumentClick = async (document: Document) => {
    try {
      await dispatch(
        updateDocument({
          documentId: document.id,
          projectId: project.id,
          payload: {
            isActive: true,
          },
        })
      ).unwrap();

      dispatch(
        setActiveDocuments({
          id: document.id,
        })
      );

      await router.push(`/discovery/${project.id}`);
    } catch (error) {
      console.error("Error in handleDocumentClick:", error);
      toast.error("Failed to open document");
    }
  };

  const renderCarouselContent = useCallback(() => {
    if (isLoading) {
      return Array(3)
        .fill(null)
        .map((_, index) => (
          <CarouselItem
            key={`skeleton-${index}`}
            className=" md:basis-1/2 lg:basis-1/3 flex-shrink-0 pl-3"
          >
            <ImageSkeleton />
          </CarouselItem>
        ));
    }

    return documents.map((doc: Document) => (
      <CarouselItem
        key={doc.id}
        className="group pl-0 md:basis-1/2 lg:basis-1/3 overflow-hidden"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDocumentClick(doc);
        }}
      >
        <div className="overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:translate-y-1 rounded-md pl-2">
          <div className="pl-2  pb-2 pt-2 rounded-md">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md

          [&_.rpv-core__spinner]:!hidden [&_.rpv-core__doc-loading]:!hidden [&_.rpv-core__loading-status]:!hidden [&_.rpv-core__progress-bar]:!hidden [&_.rpv-core__loading]:!hidden [&_.rpv-loading]:!hidden [&_[data-testid*='loading']]:!hidden [&_[class*='loading']]:!hidden [&_[class*='spinner']]:!hidden">
                     {/* <div className="bg-white [&_.rpv-core__spinner]:!hidden [&_.rpv-core__doc-loading]:!hidden [&_.rpv-core__loading-status]:!hidden [&_.rpv-core__progress-bar]:!hidden [&_.rpv-core__loading]:!hidden [&_.rpv-loading]:!hidden [&_[data-testid*='loading']]:!hidden [&_[class*='loading']]:!hidden [&_[class*='spinner']]:!hidden"> */}
                     <style dangerouslySetInnerHTML={{
               __html: `
                 .rpv-core__page-layer::after {
                   box-shadow: none !important;
                   border-radius: 4px !important;
                 }
                 .rpv-core__viewer {
                   height: 100% !important;
                   border-radius: 4px !important;
                   background-color: #F0F4FD !important;
                   overflow: hidden !important;
                   pointer-events: none !important;
                 }
                 .rpv-core__inner-pages {
                   height: 100% !important;
                   border-radius: 4px !important;
                   background-color: #F0F4FD !important;
                   overflow: hidden !important;
                   pointer-events: none !important;
                 }
                 .rpv-core__inner-current-page-0 {
                   height: 100% !important;
                   display: flex !important;
                   align-items: stretch !important;
                   border-radius: 4px !important;
                   background-color: #F0F4FD !important;
                   overflow: hidden !important;
                   pointer-events: none !important;
                 }
                 .rpv-core__page-layer {
                   height: 100% !important;
                   width: 100% !important;
                   transform: scale(1.15) !important;
                   transform-origin: top left !important;
                   border-radius: 4px !important;
                   background-color: #F0F4FD !important;
                   overflow: hidden !important;
                   pointer-events: none !important;
                   position: relative !important;
                 }
                 .rpv-core__inner-pages.rpv-core__inner-pages--vertical{
                   background-color: #F0F4FD !important;
                   overflow: hidden !important;
                   pointer-events: none !important;
                 }
                 .rpv-core__page {
                   overflow: hidden !important;
                   pointer-events: none !important;
                   position: static !important;
                 }
                 .rpv-core__canvas-layer {
                   overflow: hidden !important;
                   pointer-events: none !important;
                 }
                 .rpv-core__text-layer {
                   overflow: hidden !important;
                   pointer-events: none !important;
                 }
                 .rpv-core__annotation-layer {
                   overflow: hidden !important;
                   pointer-events: none !important;
                 }
               `
             }} />
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer
                      fileUrl={
                        doc.url
                          ? `${baseUrl(doc.url)}/Processing/viewer/page_1.pdf`
                          : doc.imageUrl || ""
                      }
                      defaultScale={SpecialZoomLevel.PageWidth}
                      renderLoader={() => <></>}
                    />
                  </Worker>
                  </div>
                  {/* </div> */}
                  </div>
        </div>
      </CarouselItem>
    ));
  }, [documents, isLoading]);

  useEffect(() => {
    setIsLoading(documents.length === 0);
  }, [documents]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => setIsLoading(true)}
    >
      <Link
        href={`/discovery/${project.id}`}
        className="group block"
        onClick={(e) => {
          e.stopPropagation();
          if (isModalClosing) {
            e.preventDefault();
          }
        }}
      >
        <Card
          className="relative w-full rounded-[12px] border-1 bg-white border-[#eaf0fc] hover:shadow-custom-blue transition-colors duration-200 group-hover:shadow-custom-blue"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardContent className="flex flex-col gap-2 px-0 pb-2">
            <Carousel className="w-full rounded-t-[12px] bg-[#F0F4FD] p-2">
              <CarouselContent className="-ml-4 px-1 flex overflow-x-auto scrollbar-hide">
                {renderCarouselContent()}
              </CarouselContent>
            </Carousel>

            <div className="flex flex-col px-2 gap-1">
              {/*  <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h2
                      ref={textRef}
                      className="text-[20px] font-medium tracking-tight"
                    >
                      {truncateText(project.name, 30)}
                    </h2>
                  </TooltipTrigger>
                  <TooltipContent className='bg-white text-[20px] rounded'>
                    {project.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider> */}
              <div className="flex w-full justify-between px-2 items-center">
                <h2
                  ref={textRef}
                  className="text-[16px] font-medium tracking-tight"
                >
                  {truncateText(project.name, 35)}
                </h2>
                <p className="text-[14px] text-[#9BABC7]">
                  {calculateProjectLength(project.id) || "0"} Documents
                </p>
              </div>

              <div className="flex w-full px-2 justify-between items-center">
                <p className="text-[14px] text-[#9BABC7]">
                  {formatDate(project.createdAt)}
                </p>
                <div
                  className={`transition-opacity duration-200 ${(isHovered || isDropdownOpen) ? "opacity-100" : "opacity-0"}`}
                >
                  <DropdownMenu onOpenChange={setIsDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isModalClosing}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-[190px] p-2 rounded border-1 border-[#EAF0FC] bg-white shadow-custom-blue"
                    >
                      <DropdownMenuItem
                        onClick={handleEdit}
                        className="flex items-center py-2 justify-start gap-2 text-[14px] text-[#001742] data-[highlighted]:bg-[#F3F7FF] rounded cursor-pointer"
                      >
                        <SquarePen className="h-6 w-6" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="flex items-center py-2 justify-start gap-2 text-[14px] text-red-500 data-[highlighted]:bg-red-100 data-[highlighted]:text-red-500 rounded cursor-pointer"
                      >
                        <Trash className="h-6 w-6" />
                        Remove project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {isEditModalOpen && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => handleModalClose(() => setIsEditModalOpen(false))}
          project={project}
          onUpdate={handleUpdate}
          isUpdating={isUpdating}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteProjectModal
          isOpen={isDeleteModalOpen}
          onClose={() => handleModalClose(() => setIsDeleteModalOpen(false))}
          projectId={project.id}
          onDelete={onDeleteProject}
        />
      )}
    </ErrorBoundary>
  );
}
