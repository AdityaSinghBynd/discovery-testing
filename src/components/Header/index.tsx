import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import { HomeIcon } from "lucide-react";
import SearchField from "./Search";
import NavigationToggle from "./NavigationToggle";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { updateProject } from "@/redux/projectDocuments/projectDocumentsThunks";
import { HeaderProps } from "@/interface/components/header.interface";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

const ProjectHeader: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSearchPerformed,
  handleSearchClick,
  workspaceId,
  documentId,
  title,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [isProjectNameUpdating, setIsProjectNameUpdating] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [textareaValue, setTextareaValue] = useState("");

  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLDivElement | null>(null);
  const projectNameUpdateTimerRef = useRef<NodeJS.Timeout>();

  const appDispatch: AppDispatch = useDispatch();

  const { selectedProject } = useSelector(
    (state: RootState) => state.projectDocuments,
  );

  const { isLoading: isSearchLoading } = useSelector(
    (state: RootState) => state.search
  );

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    const targetElement = event.target as Node;
    const isClickOutsideDropdown =
      dropdownMenuRef.current &&
      !dropdownMenuRef.current.contains(targetElement);
    const isClickOutsideMenuButton =
      menuButtonRef.current && !menuButtonRef.current.contains(targetElement);

    if (isClickOutsideDropdown && isClickOutsideMenuButton) {
      setIsDropdownVisible(false);
    }
  }, []);

  const updateProjectNameWithValidation = useCallback(
    async (newName: string) => {
      if (!newName?.trim() || !selectedProject?.id || isProjectNameUpdating)
        return;

      try {
        setIsProjectNameUpdating(true);
        await appDispatch(
          updateProject({ payload: { name: newName.trim() } }),
        ).unwrap();
      } catch (error) {
        console.error("Project name update failed:", error);
        setCurrentProjectName(selectedProject.name || "");
      } finally {
        setIsProjectNameUpdating(false);
      }
    },
    [appDispatch, selectedProject, isProjectNameUpdating],
  );

  const debouncedProjectNameUpdate = useCallback(
    (newName: string) => {
      if (projectNameUpdateTimerRef.current) {
        clearTimeout(projectNameUpdateTimerRef.current);
      }

      projectNameUpdateTimerRef.current = setTimeout(() => {
        updateProjectNameWithValidation(newName);
      }, 1000);
    },
    [updateProjectNameWithValidation],
  );

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setTextareaValue(newValue);
    setCurrentProjectName(newValue);
    debouncedProjectNameUpdate(newValue);
  };

  useEffect(() => {
    if (selectedProject?.name) {
      setCurrentProjectName(selectedProject.name);
    }
  }, [selectedProject]);

  useEffect(() => {
    const handleFullscreenStateChange = () => {
      setIsFullscreenMode(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenStateChange);
    return () =>
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenStateChange,
      );
  }, []);

  useEffect(() => {
    if (isDropdownVisible) {
      document.addEventListener("mousedown", handleOutsideClick);

      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") setIsDropdownVisible(false);
      };
      document.addEventListener("keydown", handleEscapeKey);

      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [isDropdownVisible, handleOutsideClick]);

  useEffect(() => {
    return () => {
      if (projectNameUpdateTimerRef.current) {
        clearTimeout(projectNameUpdateTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-[45px] bg-[#f7f9fe] py-1 px-2 flex items-center">
      {/* Left section - Project Name */}
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1">
          <Link href="/" className="flex items-center gap-1 hover:bg-[#EDF2FD] p-1 rounded">
          <label className="text-[#001742] text-sm cursor-pointer bg-[#EAF0FC] p-1 rounded"><HomeIcon className="w-4 h-4 text-[#004CE6]" /></label>
           <p className="text-[#001742] text-sm font-medium">Your projects</p>
          </Link>
          <span className="text-[#9babc7]">/</span>
        </div>
        <div className="flex items-center gap-2 ml-1">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <input
                type="text"
                className="bg-transparent text-sm text-[#001742] font-medium focus:outline-none text-ellipsis cursor-pointer"
                value={currentProjectName}
                readOnly
                placeholder="Enter Project Name"
                aria-label="Project name input"
                disabled={isProjectNameUpdating}
              />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[320px] p-0 rounded border-0 shadow-none">
              <Textarea
                value={currentProjectName}
                onChange={handleTextareaChange}
                placeholder="Enter Project Name"
                className="min-h-[60px] text-sm text-[#001742] font-medium resize-none rounded border-1 border-[#eaf0fc] shadow-custom-blue"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Center section - Search Field */}
      <div className="flex-1 flex justify-center">
        {selectedProject?.tabSelected === "Discovery" && (
          <div className="w-[60%] max-w-2xl">
            <SearchField
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onSearchPerformed={onSearchPerformed}
              isLoading={isSearchLoading}
            />
          </div>
        )}
      </div>

      {/* Right section - Navigation Toggle */}
      <div className="flex justify-end">
        <NavigationToggle selected={selectedProject.tabSelected} />
      </div>
    </div>
  );
};

export default ProjectHeader;