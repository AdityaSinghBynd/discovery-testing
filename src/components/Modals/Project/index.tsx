"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, CircleX, Loader2, Trash, X, Check, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { truncateText, getRelativeTime } from "@/utils/utils";
import pageImageDemo from "../../../../public/images/pageImageDemo.png";
import pageImageDemo2 from "../../../../public/images/pageImageDemo2.png";
import pageImageDemo3 from "../../../../public/images/pageImageDemo3.png";
import pageImageDemo4 from "../../../../public/images/pageImageDemo4.png";
import AshokLeyland from "../../../../public/images/AshokLeyland.png";
import AxisBank from "../../../../public/images/AxisBank.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../../ui/breadcrumb";
import FileUpload from "@/components/FileUpload";
import { AppDispatch, RootState } from "@/store/store";
import {
  setCurrentCompany,
  setIsDocument,
} from "@/redux/companies/companiesSlice";
import {
  addProjectDocument,
  createProjectWithDocuments,
  deleteTab,
  updateProject,
  fetchProjectDocumentsByProjectId,
} from "@/redux/projectDocuments/projectDocumentsThunks";
import { setIsOpen } from "@/redux/createProjectModal/createProjectModal";
import {
  setSelectedProjectDocuments,
  removeSelectedDocument,
} from "@/redux/projectDocuments/projectDocumentsSlice";
import { fetchRecentUploadedDocuments, deleteRecentUploadedDocuments } from "@/redux/recentUploadedDocuments/recentUploadedThunks";
import PdfIcon from "../../../../public/images/pdfIcon.svg";
import NoDocument from "../../../../public/images/noDocument.svg";
import arrowRight from "../../../../public/images/arrowRight.svg";
import { deleteProjectThunk } from "@/redux/project/projectThunks";
import arrowRightGray from "../../../../public/images/arrowRightGray.svg";
import MainContent from "./MainContent";
import { StaticImageData } from "next/image";
import {
  resetRecentUploaded,
  removeRecentUpload
} from "@/redux/recentUploadedDocuments/recentUploadedSlice";
import { useToastStore } from "@/store/useTostStore";
import { useSocketConnection } from "@/hooks/useSocketConnection";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import ResearchReport from "./sub-sections/reasearch-report";
import BrokersReport from "./sub-sections";
import ResearchReport from "./sub-sections/reasearch-report";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import IndustryRegulation from "./sub-sections/industry-regulation";

interface ImageCarouselProps {
  images: StaticImageData[];
}

interface ModalProps {
  activeView: View;
  currentCompany: string;
  backButtonText?: string;
  handleBack: () => void;
  handleForward: () => void;
  onOpenChange: (open: boolean) => void;
  projectName: string;
}

interface DocumentUpload {
  id: string;
  name: string;
  date: string;
  year?: number;
  status?: "loading" | "completed" | "failed" | "idle";
}

const images = [
  pageImageDemo,
  pageImageDemo2,
  pageImageDemo3,
  pageImageDemo4,
  AshokLeyland,
  AxisBank,
];

type View = "project-name" | "uploads" | "company-disclosures" | "documents" | "ipo-research" | "industry-regulation";

const BreadcrumbNav = ({
  activeView,
  currentCompany,
  backButtonText,
  handleBack,
  handleForward,
  onOpenChange,
  projectName,
}: {
  activeView: View;
  currentCompany: string;
  backButtonText?: string;
  handleBack: () => void;
  handleForward: () => void;
  onOpenChange: (open: boolean) => void;
  projectName: string;
}) => (
  <div className="flex items-center h-full w-full p-2.5">
    <div className="flex items-center gap-2 mr-4">
      <button
        onClick={handleBack}
        disabled={activeView === "project-name"}
        className={`p-1 rounded ${activeView === "project-name"
          ? "text-gray-400"
          : "text-gray-700 hover:bg-gray-100"
          }`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={handleForward}
        disabled={activeView === "project-name" && !projectName}
        className={`p-1 rounded ${activeView === "project-name" && !projectName
          ? "text-gray-400"
          : "text-gray-700 hover:bg-gray-100"
          }`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
    <Breadcrumb className="flex-1">
      <BreadcrumbList>
        <BreadcrumbItem>
          <span className="text-gray-900 font-semibold">
            {activeView === "project-name"
              ? "Add Project Name"
              : "Add documents"}
          </span>
        </BreadcrumbItem>
        {activeView !== "project-name" && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900"
              >
                {activeView === "uploads" ? "Uploads" :
                  activeView === "company-disclosures" || activeView === "documents"
                    ? "Company disclosures"
                    : "IPO research"}
              </button>
            </BreadcrumbItem>
          </>
        )}
        {activeView === "documents" && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-gray-900">{currentCompany}</span>
            </BreadcrumbItem>
            {backButtonText && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <span className="text-gray-900">{backButtonText}</span>
                </BreadcrumbItem>
              </>
            )}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
    <button onClick={() => onOpenChange(false)} className="ml-auto">
      <X className="h-5 w-5 text-gray-700" />
    </button>
  </div>
);

const ProjectNameScreen = ({
  projectName,
  setProjectName,
  onNext,
  isDiscoveryPath,
  selectedDocs,
}: {
  projectName: string;
  setProjectName: (name: string) => void;
  onNext: () => void;
  isDiscoveryPath: () => boolean;
  selectedDocs: any;
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && projectName && !isDiscoveryPath()) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="w-full max-w-md">
        <label
          htmlFor="projectName"
          className="block text-md font-medium text-gray-700 mb-2"
        ></label>
        <input
          type="text"
          placeholder="Enter project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isDiscoveryPath()}
          className={`px-3 py-2 bg-[#fff] h-12 w-full border-1 border-[#EAF0FC] text-sm rounded mb-1 shadow-custom-blue focus:border-[#004ce6] focus:outline-none ${isDiscoveryPath() ? "cursor-not-allowed bg-gray-200" : ""
            }`}
        />
      </div>
      <Button
        onClick={onNext}
        disabled={!projectName && !isDiscoveryPath()}
        className={`px-6 py-2 text-gray-400 ${!projectName && !isDiscoveryPath()
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700"
          } rounded`}
      >
        Select Documents
        <Image
          src={!projectName && !isDiscoveryPath() ? arrowRightGray : arrowRight}
          alt="arrowRight"
          className="h-5 w-5 text-[#98A2B3]"
        />
      </Button>
    </div>
  );
};

const SelectedDocumentsList = ({
  selectedDocs,
  onRemove,
}: {
  selectedDocs: DocumentUpload[];
  onRemove: (id: string) => void;
}) => (
  <ScrollArea className="h-[510px]">
    <div className="flex flex-col gap-2 flex-grow overflow-y-auto">
      {selectedDocs.length > 0 ? (
        selectedDocs.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center justify-between w-full gap-2 px-2 py-2 bg-[#004CE608] border-1 border-[#eaf0fc] rounded">
              <div className="flex gap-2 items-center">
                <Image src={PdfIcon} alt="PDF Icon" className="h-4 w-4" />
                <span className="text-sm">
                  {truncateText(
                    doc.name?.replace(/[^a-zA-Z0-9\s]/g, " ") ||
                    "Document Name",
                    20,
                  )}
                </span>
              </div>
              <X
                className="h-4 w-4 cursor-pointer"
                onClick={() => onRemove(doc.id)}
              />
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center text-sm text-gray-500 text-center py-2 gap-2">
          <Image src={NoDocument} alt="No Document Selected" />
          No documents selected
        </div>
      )}
    </div>
  </ScrollArea>
);

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 2500);
    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <div className="relative h-[350px] w-full overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {images.map((image, index) => {
          let position = index - activeIndex;

          if (position < -Math.floor(images.length / 2)) {
            position += images.length;
          } else if (position > Math.floor(images.length / 2)) {
            position -= images.length;
          }

          const scale = index === activeIndex ? 1 : 0.8;
          const height = 350;
          const isVisible = Math.abs(position) <= Math.floor(images.length / 4);

          return (
            <div
              key={index}
              className="absolute transition-all duration-700 ease-in-out cursor-pointer select-none"
              style={{
                transform: `translateX(${position * 260}px) scale(${scale})`,
                zIndex: images.length - Math.abs(position),
                opacity: isVisible ? (index === activeIndex ? 1 : 0.4) : 0,
                visibility: isVisible ? "visible" : "hidden",
                filter: isVisible
                  ? `blur(${Math.abs(position) * 1}px)`
                  : "none",
              }}
              onClick={() => setActiveIndex(index)}
            >
              <div className="relative">
                <Image
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="shadow-custom-blue select-none border-1 border-[#eaf0fc]"
                  style={{
                    width: index === activeIndex ? "260px" : "230px",
                    height: index === activeIndex ? `${height}px` : "320px",
                    objectFit: "cover",
                  }}
                  width={index === activeIndex ? 300 : 230}
                  height={height}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper to check if a document is idle (not processed)
function isDocumentIdle(doc: any) {
  // You may want to adjust this logic based on your actual doc structure
  // Here, we assume status "idle" or "not processed" means idle
  return (
    doc.status === "idle" ||
    doc.status === "processing" ||
    doc.status === "loading"
  );
}

export function UploadModal() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch: AppDispatch = useDispatch();
  const toastStore = useToastStore();
  const { simulateFileUpload } = useSocketConnection();

  const [projectName, setProjectName] = useState("");
  const [backButtonText, setBackButtonText] = useState("Back");
  const [activeView, setActiveView] = useState<View>("uploads");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("uploads");
  const isDocument = useSelector(
    (state: RootState) => state.companies.isDocument,
  );
  const currentCompany = useSelector(
    (state: RootState) => state.companies.currentCompany,
  );
  const selectedDocs = useSelector(
    (state: RootState) => state.projectDocuments.selectedDocuments,
  );
  const isOpen = useSelector(
    (state: RootState) => state.createProjectModal.isOpen,
  );
  const { selectedProject } = useSelector(
    (state: RootState) => state.projectDocuments,
  );
  const recentUploadedDocuments = useSelector(
    (state: RootState) => state.recentUploaded.recentUploadedDocuments,
  );
  const isDiscoveryPath = useCallback(
    () => pathname?.includes("/discovery/"),
    [pathname],
  );
  const [modalOpenTime, setModalOpenTime] = useState<Date | null>(null);
  const [newlyUploadedIds, setNewlyUploadedIds] = useState<Set<string>>(new Set());
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Alert state for idle documents
  const [showIdleAlert, setShowIdleAlert] = useState(false);

  // Filter recentUploadedDocuments based on global search when uploads tab is active
  const filteredRecentUploadedDocuments = useMemo(() => {
    if (activeTab !== "uploads" || !searchQuery) {
      return recentUploadedDocuments;
    }
    return recentUploadedDocuments.filter(doc =>
      doc.name.toLowerCase().startsWith(searchQuery.toLowerCase())
    );
  }, [recentUploadedDocuments, searchQuery, activeTab]);


  const handleForward = () => {
    if (activeView === "project-name" && projectName) {
      setActiveView("uploads");
      setActiveTab("uploads");
    }
  };

  const handleDelete = useCallback((id: string) => {
    // Optimistically remove from UI first
    dispatch(removeRecentUpload(id));
    // Remove from selected documents if it exists there
    const isSelected = selectedDocs.some((doc: any) => doc.id === id);
    if (isSelected) {
      dispatch(removeSelectedDocument(id));
    }
    // Then send API request
    dispatch(deleteRecentUploadedDocuments({ id }));
  }, [dispatch, selectedDocs]);

  const handleBack = useCallback(() => {
    if (activeView === "uploads" || activeView === "company-disclosures" || activeView === "ipo-research" || activeView === "industry-regulation") {
      setActiveView("project-name");
    } else if (activeView === "documents") {
      setActiveView("company-disclosures");
      setActiveTab("company-disclosures");
      dispatch(setIsDocument(false));
      dispatch(setCurrentCompany(null));
      setBackButtonText("");
    }
  }, [activeView, dispatch]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setActiveView(value as View);
    dispatch(setCurrentCompany(null));
    setBackButtonText("");
    dispatch(setIsDocument(false));
    // Clear search when changing tabs
    // setSearchQuery("");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  useEffect(() => {
    if (isOpen) {
      if (isDiscoveryPath()) {
        setProjectName(selectedProject.name || "Project Name");
        setActiveView("uploads");
        setActiveTab("uploads");
      } else {
        setProjectName("");
        setActiveView("project-name");
        dispatch(removeSelectedDocument(selectedDocs));
      }
    }
  }, [isOpen, isDiscoveryPath, selectedProject, dispatch]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchRecentUploadedDocuments());
      setModalOpenTime(new Date());
      setNewlyUploadedIds(new Set());
    } else {
      setModalOpenTime(null);
      setNewlyUploadedIds(new Set());
    }
  }, [dispatch, isOpen]);

  const handleDocumentSelect = useCallback(
    (doc: DocumentUpload) => {
      if (doc.status !== "failed") {
        dispatch(setSelectedProjectDocuments({ id: doc.id, name: doc.name, status: doc.status }));
      }
    },
    [dispatch],
  );

  const handleCloseClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (typeof pathname === "string" && id) {
      try {
        await dispatch(
          deleteTab({
            payload: { documentId: id, projectId: pathname.split("/")[2] },
          }),
        ).unwrap();

        if (selectedDocs.length === 1) {
          await dispatch(
            deleteProjectThunk(Number(pathname.split("/")[2])),
          ).unwrap();
          await dispatch(setIsOpen(false));
          router.push("/");
        }
      } catch (error) {
        console.error("Error deleting document or project:", error);
      }
    }
  };

  useEffect(() => {
    if (isDocument) {
      setActiveView("documents");
    }
  }, [isDocument]);

  useEffect(() => {
    if (!isOpen) {
      dispatch(resetRecentUploaded());
    }
  }, [isOpen, dispatch]);

  // Setup the socket connections for any currently loading documents
  useEffect(() => {
    if (isOpen) {
      // Find all documents that are in loading state
      const loadingDocs = recentUploadedDocuments.filter(
        doc => doc.status === "loading" || doc.status === "processing"
      );

      // Initialize socket connections for each of them
      if (loadingDocs.length > 0) {
        loadingDocs.forEach(simulateFileUpload);
      }
    }
  }, [isOpen, recentUploadedDocuments, simulateFileUpload]);

  // Store the idle docs for alert
  const [idleDocs, setIdleDocs] = useState<any[]>([]);

  // The actual submit logic, separated for alert
  const doSubmit = async () => {
    try {
      if (isDiscoveryPath()) {
        await dispatch(
          addProjectDocument({
            projectId: selectedProject.id,
            documentIds: selectedDocs.map((doc: any) => doc.id),
          }),
        ).unwrap();

        // Force a refresh of document statuses after adding documents
        if (selectedProject.id) {
          await dispatch(fetchProjectDocumentsByProjectId(selectedProject.id));
          dispatch(setIsOpen(false));
        }
      } else {
        setIsCreatingProject(true);
        const resultAction = await dispatch(createProjectWithDocuments());

        if (createProjectWithDocuments.fulfilled.match(resultAction)) {
          const { projectId } = resultAction.payload;

          if (projectName) {
            await dispatch(updateProject({ payload: { name: projectName } }));
          }

          router.push(`/discovery/${projectId}`);

          setTimeout(() => {
            dispatch(setIsOpen(false));
            setIsCreatingProject(false);
          }, 100);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // handleSubmit with idle check and alert
  const handleSubmit = async () => {
    // Check for idle docs (status === "idle")
    const idle = selectedDocs.filter(doc => doc.status === "idle");
    console.log("selectedDocs", selectedDocs);
    console.log("idle", idle);
    if (idle.length > 0) {
      setIdleDocs(idle);
      setShowIdleAlert(true);
      return;
    }
    await doSubmit();
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      dispatch(resetRecentUploaded());
      setSearchQuery(""); // Reset search query
      setActiveView("uploads"); // Reset to initial view
      setActiveTab("uploads"); // Reset to initial tab
    }
    dispatch(setIsOpen(open));
  };

  // --- IMPROVEMENT: Helper to determine if search should be disabled ---
  const isSearchDisabled = activeTab === "industry-regulation";

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      <DialogOverlay className="bg-cyan-200/20 backdrop-blur-sm" />
      <DialogContent className="max-w-7xl rounded p-0 gap-0 bg-[#f5f7fa] h-[730px]">
        <DialogTitle className="sr-only">
          Document Management Dialog
        </DialogTitle>
        <DialogHeader className="flex items-center rounded justify-between h-[50px] w-full bg-white border-b-2 border-[#EAF0FC]">
          <BreadcrumbNav
            activeView={activeView}
            currentCompany={currentCompany}
            backButtonText={backButtonText}
            handleBack={handleBack}
            handleForward={handleForward}
            onOpenChange={(open) => dispatch(setIsOpen(open))}
            projectName={projectName}
          />
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {activeView === "project-name" ? (
            <div className="flex flex-col gap-4">
              <p className="w-full flex items-center justify-center text-[18px] mb-4 font-medium text-[#001742]">
                1000+ Company documents
              </p>
              <ImageCarousel images={images} />
              <ProjectNameScreen
                projectName={projectName}
                setProjectName={setProjectName}
                onNext={handleForward}
                isDiscoveryPath={isDiscoveryPath}
                selectedDocs={selectedDocs}
              />
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_270px] bg-[#f7f9fe] rounded h-full">
              {/* Main Content Area with Search and Tabs */}
              <div className="flex flex-col gap-2 h-[660px] rounded p-3">
                {/* Global Search */}
                <div className="relative rounded border-1 border-[#eaf0fc] w-[550px] mb-1">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isSearchDisabled ? "text-gray-300" : "text-[#001742]"}`} />
                  <input
                    type="text"
                    placeholder={isSearchDisabled ? "Search is disabled for Industry regulation" : "Describe your reports"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${isSearchDisabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-[#9babc7] bg-white"}`}
                    disabled={isSearchDisabled}
                    tabIndex={isSearchDisabled ? -1 : 0}
                  />
                  {isSearchDisabled && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 select-none">
                      Search disabled
                    </span>
                  )}
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
                  <TabsList className="flex items-center justify-start w-full mb-2 bg-transparent gap-2  rounded-lg p-1">
                    <TabsTrigger value="uploads" className="text-sm text-[#4e5971] data-[state=active]:text-[#004CE6] border-1 border-[#eaf0fc] rounded-[4px] shadow-none py-1 px-2 max-w-max">Uploads</TabsTrigger>
                    <TabsTrigger value="company-disclosures" className="text-sm text-[#4e5971] data-[state=active]:text-[#004CE6] border-1 border-[#eaf0fc] rounded-[4px] shadow-none py-1 px-2 max-w-max">Company disclosures</TabsTrigger>
                    <TabsTrigger value="ipo-research" className="text-sm text-[#4e5971] data-[state=active]:text-[#004CE6] border-1 border-[#eaf0fc] rounded-[4px] shadow-none py-1 px-2 max-w-max">IPO research</TabsTrigger>
                    <TabsTrigger value="industry-regulation" className="text-sm text-[#4e5971] data-[state=active]:text-[#004CE6] border-1 border-[#eaf0fc] rounded-[4px] shadow-none py-1 px-2 max-w-max">Industry regulation</TabsTrigger>
                  </TabsList>

                  <TabsContent value="uploads" className="flex-1 bg-white p-2.5 rounded-t-[8px] shadow-custom-blue overflow-hidden mt-0">
                    <div className="flex flex-col gap-2 h-full">

                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[18px] text-[#001742]">Your Uploaded reports</h3>
                      </div>
                      <FileUpload />
                      <div className="flex items-center justify-between w-full px-1">
                        <p className="text-xs text-[#4e5971]">Name</p>
                        <p className="text-xs text-[#4e5971]">Date</p>
                      </div>
                      <div className="overflow-y-auto flex-1 space-y-2 max-h-[400px] pb-[250px] min-h-0 scrollbar-hide">
                        {filteredRecentUploadedDocuments.length > 0 ? (
                          [...filteredRecentUploadedDocuments]
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((doc: any) => (
                              <div
                                key={doc.id}
                                className={`group flex items-center justify-between gap-2 p-2 rounded ${doc.status === "failed"
                                  ? "cursor-not-allowed bg-red-50"
                                  : "cursor-pointer hover:bg-white"
                                  }`}
                                onClick={() => {
                                  if (openPopoverId === doc.id) return;
                                  if (doc.status !== "failed") handleDocumentSelect(doc);
                                }}
                                aria-disabled={doc.status !== "completed"}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    <div className="relative flex items-center">
                                      {doc.status === "failed" ? (
                                        <Image
                                          src={PdfIcon}
                                          alt="PDF Icon"
                                          className="h-4 w-4"
                                        />
                                      ) : (
                                        <>
                                          <Image
                                            src={PdfIcon}
                                            alt="PDF Icon"
                                            className={`h-4 w-4 ${selectedDocs.some(
                                              (selected: any) =>
                                                selected.id === doc.id
                                            )
                                              ? "hidden"
                                              : "group-hover:hidden"
                                              }`}
                                          />
                                          <input
                                            type="checkbox"
                                            checked={selectedDocs.some(
                                              (selected: any) =>
                                                selected.id === doc.id
                                            )}
                                            onChange={() => handleDocumentSelect(doc)}
                                            className={`rounded border-gray-300 w-4 h-4 cursor-pointer accent-blue-500 hover:accent-blue-700 ${selectedDocs.some(
                                              (selected: any) =>
                                                selected.id === doc.id
                                            )
                                              ? "block"
                                              : "hidden group-hover:block"
                                              }`}
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </>
                                      )}
                                    </div>
                                    <span className="text-sm">
                                      {truncateText(doc.name, 70)}
                                      {doc.status === "failed" && " - Upload failed"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 group">
                                    <span className="text-sm text-[#9babc7] ml-auto group-hover:hidden">
                                      {getRelativeTime(doc.createdAt)}
                                    </span>
                                    {(doc.status === "completed" || doc.status === "failed") && (
                                      <Popover
                                        open={openPopoverId === doc.id}
                                        onOpenChange={(open) => setOpenPopoverId(open ? doc.id : null)}
                                      >
                                        <PopoverTrigger asChild>
                                          <button
                                            className={`h-4 w-4 text-red-500 cursor-pointer ${openPopoverId === doc.id ? "block" : "group-hover:block hidden"
                                              }`}
                                            onClick={e => {
                                              e.stopPropagation();
                                            }}
                                            type="button"
                                          >
                                            <Trash className="h-4 w-4" />
                                          </button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          className="z-[9999] w-auto p-2 bg-white shadow-custom-blue rounded border border-[#EAF0FC] pointer-events-auto"
                                          align="end"
                                          side="left"
                                          sideOffset={5}
                                          onPointerDownOutside={e => {
                                            e.preventDefault();
                                            setOpenPopoverId(null);
                                          }}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-700">
                                              Are you sure want to delete the document?
                                            </span>
                                            <button
                                              onClick={e => {
                                                e.stopPropagation();
                                                handleDelete(doc.id);
                                                setOpenPopoverId(null);
                                              }}
                                              className="p-1 rounded hover:bg-green-50 transition-colors"
                                              type="button"
                                            >
                                              <Check className="h-4 w-4 text-green-600" />
                                            </button>
                                            <button
                                              onClick={e => {
                                                e.stopPropagation();
                                                setOpenPopoverId(null);
                                              }}
                                              className="p-1 rounded hover:bg-red-50 transition-colors"
                                              type="button"
                                            >
                                              <X className="h-4 w-4 text-red-600" />
                                            </button>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="flex flex-col items-center justify-center text-sm text-gray-500 text-center py-8 gap-2">
                            <Image src={NoDocument} alt="No Document Selected" width={130} height={130} />
                            {searchQuery && activeTab === "uploads"
                              ? `No documents found starting with "${searchQuery}"`
                              : "No uploaded documents"
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="company-disclosures" className="flex-1 bg-white p-2.5 rounded-t-[8px] shadow-custom-blue overflow-hidden mt-0">
                    <MainContent
                      companyName={currentCompany}
                      activeView={activeView as any}
                      setActiveView={setActiveView as any}
                      setBackButtonText={setBackButtonText}
                      globalSearchQuery={activeTab === "company-disclosures" ? searchQuery : ""}
                      onClearSearch={handleClearSearch}
                      selectedTab={"company-disclosures"}
                    />
                  </TabsContent>

                  <TabsContent value="ipo-research" className="flex-1 bg-white p-2.5 rounded-t-[8px] shadow-custom-blue overflow-hidden mt-0">
                    <MainContent
                      companyName={currentCompany}
                      activeView={activeView as any}
                      setActiveView={setActiveView as any}
                      setBackButtonText={setBackButtonText}
                      globalSearchQuery={activeTab === "ipo-research" ? searchQuery : ""}
                      onClearSearch={handleClearSearch}
                      selectedTab={"ipo-research"}
                    />
                  </TabsContent>

                  <TabsContent value="industry-regulation" className="flex-1 bg-white p-2.5 rounded-t-[8px] shadow-custom-blue overflow-hidden mt-0">
                    <div className="flex flex-col h-full">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-medium text-[18px] text-[#001742]">Industry Regulation </h3>
                        <span className="text-xs text-gray-400 italic">Search is disabled</span>
                      </div>
                      <IndustryRegulation />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Selected Documents Sidebar */}
              <div className="flex flex-col p-2 rounded bg-white shadow-[1px_2px_4px_0px_rgba(0,76,230,0.05)] gap-2">
                <h3 className="font-[12px] font-semibold text-[#4E5971]">
                  Selected documents
                </h3>
                <SelectedDocumentsList
                  selectedDocs={selectedDocs as any}
                  onRemove={(id: any) =>
                    isDiscoveryPath()
                      ? handleCloseClick(
                        event as unknown as React.MouseEvent,
                        id,
                      )
                      : dispatch(removeSelectedDocument(id))
                  }
                />

                <div className="flex self-center mt-auto mb-3">
                  <Button
                    className={`px-4 py-2 rounded text-white ${(isDiscoveryPath() && selectedDocs.length === 0) ||
                      (!isDiscoveryPath() &&
                        (!projectName || selectedDocs.length === 0))
                      ? "bg-[#E4E7EC] text-[#98A2B3] hover:bg-[#E4E7EC] cursor-not-allowed"
                      : "bg-[#004CE6] hover:bg-[#004CE6] cursor-pointer"
                      }`}
                    onClick={handleSubmit}
                    disabled={
                      isCreatingProject ||
                      (isDiscoveryPath() && selectedDocs.length === 0) ||
                      (!isDiscoveryPath() &&
                        (!projectName || selectedDocs.length === 0))
                    }
                  >
                    {isDiscoveryPath() ? "Add" : "Open"}
                    {isCreatingProject ? (
                      <Loader2 className="h-5 w-5 ml-1 animate-spin" />
                    ) : (
                      <Image
                        src={
                          (isDiscoveryPath() && selectedDocs.length === 0) ||
                            (!isDiscoveryPath() &&
                              (!projectName || selectedDocs.length === 0))
                            ? arrowRightGray
                            : arrowRight
                        }
                        alt="arrowRight"
                        className="h-5 w-5 text-[#98A2B3]"
                      />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Idle Document Alert Modal */}
        {showIdleAlert && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full border border-[#EAF0FC]">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-yellow-500 h-6 w-6" />
                <span className="font-semibold text-[#b45309] text-lg">Some documents are not processed</span>
              </div>
              <div className="mb-2 text-[#4e5971] text-sm">
                Some selected documents are not processed yet. You can only open processed documents. If you continue, the unprocessed documents will be added for processing and you will see only the processed documents now.
              </div>
              <div className="mb-3">
                <ul className="list-disc pl-5 text-xs text-[#b91c1c]">
                  {idleDocs.map((doc, idx) => (
                    <li key={doc.id || idx}>
                      {truncateText(doc.name || "Untitled Document", 40)} {doc.status ? `(${doc.status})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="border-[#eaf0fc] text-[#001742] px-4 py-1 rounded"
                  onClick={() => setShowIdleAlert(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#004CE6] text-white px-4 py-1 rounded"
                  onClick={async () => {
                    setShowIdleAlert(false);
                    await doSubmit();
                  }}
                >
                  Open
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}