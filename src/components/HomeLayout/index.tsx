import { Plus } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Project } from "@/interface/components/card.interface";
import { ProjectCard } from "@/components/Card";
import Image from "next/image";
import Header from "./Header";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchProjectDocumentsByProjectId,
  fetchProjectsByUserId,
  updateProject,
  deleteProjectThunk,
  fetchProjectDocumentList,
} from "@/redux/projectDocuments/projectDocumentsThunks";
import { setIsOpen } from "@/redux/createProjectModal/createProjectModal";
import NoDocument from "../../../public/images/noDocument.svg";
import ProjectCardSkeleton from "@/components/Skeleton/ProjectCard";
import { toast } from "react-toastify";

export default function ProjectDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, status, hasMore } = useSelector(
    (state: RootState) => state.projectDocuments,
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loadInitialData = () => {
      try {
        dispatch(fetchProjectsByUserId({ page: 1, limit: 10 }))
          .unwrap()
          .then(() => setIsInitialLoad(false));
      } catch (error) {
        console.error("Error loading initial data:", error);
        setIsInitialLoad(false);
      } finally {
        setIsInitialLoad(false);
      }
    };

    if (isInitialLoad) {
      loadInitialData();
    }
  }, [dispatch, isInitialLoad]);

  useEffect(() => {
    items.projects.map(async (item: any) => {
      await dispatch(fetchProjectDocumentList(item.id));
    });
  }, [items]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const firstEntry = entries[0];
        if (
          firstEntry.isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          status !== "loading" &&
          !isInitialLoad
        ) {
          setIsLoadingMore(true);
          try {
            const nextPage = page + 1;
            await dispatch(
              fetchProjectsByUserId({ page: nextPage, limit: 10 }),
            ).unwrap();
            setPage(nextPage);
          } finally {
            setIsLoadingMore(false);
          }
        }
      },
      { threshold: 0.1 },
    );

    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [dispatch, hasMore, status, isInitialLoad, isLoadingMore, page]);

  const openCreateModal = useCallback(() => {
    dispatch(setIsOpen(true));
  }, [dispatch]);

  const handleProjectClick = useCallback(
    async (project: Project) => {
      if (!project?.id) return;

      try {
        await dispatch(fetchProjectDocumentsByProjectId(project.id)).unwrap();
      } catch (error) {
        console.error("Error fetching project documents:", error);
      }
    },
    [dispatch],
  );

  const handleDeleteProject = useCallback(
    async (projectId: string): Promise<void> => {
      try {
        const toastId = toast.loading("Deleting Project...");
        await dispatch(deleteProjectThunk(Number(projectId))).unwrap();
        toast.update(toastId, {
          render: "Project Deleted.",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } catch (error) {
        const toastId = toast.loading("Deleting Project...");
        console.error("Error deleting project:", error);
        toast.update(toastId, {
          render: "Oops, something went wrong",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    },
    [dispatch],
  );

  const handleEditProject = useCallback(
    async (projectId: string, name: string): Promise<void> => {
      try {
        await dispatch(
          updateProject({
            payload: { name, projectId },
          }),
        ).unwrap();
      } catch (error) {
        console.error("Error updating project:", error);
      }
    },
    [dispatch],
  );

  const renderProjectGrid = () => {
    if (
      status === "loading" &&
      (!items.projects || items.projects.length === 0)
    ) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProjectCardSkeleton key={`initial-skeleton-${index}`} />
          ))}
        </div>
      );
    }

    if (!items.projects || items.projects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-400px)] text-sm text-gray-500 text-center">
          <Image src={NoDocument} alt="No Project Created" priority />
          <span className="mt-2 text-lg">No Project Created</span>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {items.projects?.map((project: any, index: number) => (
            <ProjectCard
              key={`${project.id}-${index}`}
              project={project}
              onProjectClick={handleProjectClick}
              onDeleteProject={handleDeleteProject}
              onEditProject={handleEditProject}
            />
          ))}
          {isLoadingMore && (
            <>
              {Array.from({ length: 1 }).map((_, index) => (
                <ProjectCardSkeleton key={`loading-more-${index}`} />
              ))}
            </>
          )}
        </div>
        <div ref={loaderRef} className="h-4" />
      </>
    );
  };

  return (
    <div className="flex flex-col bg-[#f7f9fe] min-h-screen w-full">
      <Header />
      <div className="flex-1 max-w-[1500px] mx-auto w-full px-4">
        <div className="flex items-center justify-between py-2 mb-4 border-b-2 border-[#EAF0FC]">
          <h1 className="text-[24px] font-medium text-[#001742]">
            Your projects
          </h1>
          <button
            className="flex items-center gap-2 bg-[#004CE6] rounded py-2 px-3 text-white font-medium text-[16px]"
            onClick={openCreateModal}
          >
            Create new
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="pb-[400px] h-screen overflow-y-auto scrollbar-hide">
          {renderProjectGrid()}
        </div>
      </div>
    </div>
  );
}
