import Header from "@/components/Header";
import Head from "next/head";
import { AppDispatch, RootState } from "@/store/store";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Discovery from "@/containers/Discovery";
import Workspace from "@/containers/Workspace";
import {
  fetchProject,
  fetchProjectDocumentsByProjectId,
} from "@/redux/projectDocuments/projectDocumentsThunks";
import { reset } from "@/redux/projectDocuments/projectDocumentsSlice";
import { toast } from "react-toastify";
import { useSSEDocumentProgress } from "@/hooks/ServerSideEvent/useProgressSSE";
import { SimiliarTables } from "@/components/Modals/SimiliarTables";

const Index = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const { slug } = router.query;
  // Memoize selectors to prevent unnecessary re-renders
  const {selectedProject, selectedDocuments} = useSelector(
    (state: RootState) => state.projectDocuments,
  );
  const recentUploadedDocuments = useSelector(
    (state: RootState) => state.recentUploaded.recentUploadedDocuments,
  );
  const isSimilarTablesOpen = useSelector(
    (state: RootState) => state.similarTables.isSimilarTablesOpen,
  );
  // Memoize loading docs filtering
  const loadingDocs = useMemo(() => {
    const today = new Date();
    // Filter recentUploadedDocuments for today's docs
    const recentDocs = recentUploadedDocuments.filter((doc: any) => {
      const docDate = new Date(doc.createdAt);
      return docDate.toDateString() === today.toDateString();
    });

    // Filter selectedDocuments for today's docs
    const selectedDocsToday = Array.isArray(selectedDocuments)
      ? selectedDocuments.filter((doc: any) => {
          const docDate = new Date(doc.createdAt);
          return docDate.toDateString() === today.toDateString();
        })
      : [];

    // Combine and deduplicate by id (if present)
    const allDocs = [...recentDocs, ...selectedDocsToday];
    const uniqueDocs = allDocs.filter(
      (doc, idx, arr) =>
        arr.findIndex((d) => d.id === doc.id) === idx
    );

    return uniqueDocs;
  }, [recentUploadedDocuments, selectedDocuments]);

  // Use the SSE progress hook (side-effect only, does not return connect/disconnect)
  useSSEDocumentProgress(loadingDocs, slug as string, dispatch);

  // Memoize workspace ID
  const workspaceId = useMemo(
    () => selectedProject?.workspace?.id,
    [selectedProject?.workspace?.id],
  );

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!slug) return;

      try {
        const [projectResponse, documentsResponse] = await Promise.all([
          dispatch(fetchProject(slug as string)).unwrap(),
          dispatch(fetchProjectDocumentsByProjectId(slug as string)).unwrap(),
        ]);

        if (!projectResponse || !documentsResponse) {
          throw new Error("Failed to fetch project data");
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast.error("Failed to load project data. Please try again.");
      }
    };

    fetchProjectData();

    return () => {
      dispatch(reset());
    };
  }, [dispatch, slug, router.asPath]);

  // No need to call connect/disconnect manually; handled by useSSEDocumentProgress

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading project...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{selectedProject.name || "Bynd"}</title>
        <meta name="description" content="Bynd fin-tech" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/ByndLogoFavicon.svg" />
      </Head>
      <main>
        <div>
          <Header />
          {selectedProject?.tabSelected === "Discovery" && (
            <Discovery workspaceId={workspaceId} />
          )}
          {selectedProject?.tabSelected === "Workspace" && (
            <Workspace workspaceId={workspaceId} />
          )}
        </div>
      </main>

      {isSimilarTablesOpen && <SimiliarTables />}
    </>
  );
};

export default Index;