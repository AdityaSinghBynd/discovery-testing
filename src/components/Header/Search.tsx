import React, { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import styles from "@/styles/Header.module.scss";
import SearchIcon from "../../../public/images/search.svg";
import Clear from "../../../public/images/clear.svg";
import InActiveSearch from "../../../public/images/InActiveSearch.svg";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { track } from "@amplitude/analytics-browser";
import {
  updateDocument,
  updateProject,
} from "@/redux/projectDocuments/projectDocumentsThunks";
import { AppDispatch, RootState } from "@/store/store";
import { search } from "@/redux/search/searchThunks";
import { searchResultsReset } from "@/redux/search/searchSlice";
import { setLocalPageLock } from "@/redux/projectDocuments/projectDocumentsSlice";
import { sanitizedName } from "@/utils/utils";

const SearchField: React.FC<any> = () => {
  const { selectedProject, activeDocument } = useSelector(
    (state: any) => state.projectDocuments,
  );
  const { isLoading: isSearchLoading, searchResults, searchResultsForAll } = useSelector(
    (state: RootState) => state.search,
  );


  const [searchQuery, setSearchQuery] = useState("");
  const dispatch: AppDispatch = useDispatch();
  const searchAbortController = useRef<AbortController | null>(null);

  // Load initial search state from selected project
  useEffect(() => {
    if (
      selectedProject?.recentSearch &&
      selectedProject.recentSearch.trim() !== searchQuery
    ) {
      handleSearch(selectedProject.recentSearch);
      setSearchQuery(selectedProject.recentSearch);
    }
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (
        !searchResults[sanitizedName(activeDocument?.url?.split("/").pop().split(".")[0])] &&
        selectedProject.recentSearch &&
        selectedProject.isSearched
      ) {
        handleSearch(selectedProject.recentSearch);
        setSearchQuery(selectedProject.recentSearch);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [activeDocument, searchResults, selectedProject]);

  useEffect(() => {
    return () => {
      setSearchQuery("");
      if (searchAbortController.current) {
        searchAbortController.current.abort();
      }
    };
  }, []);

  // Debounced search handler with request cancellation
  const handleSearch = useCallback(
    async (query: string, newValue?: boolean) => {
      if (!query?.trim()) return;

      track("search", { query });

      try {
        // Cancel any pending search request
        if (searchAbortController.current) {
          searchAbortController.current.abort();
        }

        // Create new abort controller for this request
        searchAbortController.current = new AbortController();
        
        await dispatch(
          search({
            payload: {
              isSearchForAll: newValue
                ? newValue
                : selectedProject.isSearchForAll,
              query,
              isSearched: true,
            },
            signal: searchAbortController.current.signal,
            meta: { isSearchRequest: true }
          }),
        );
      } catch (error) {
        // Only log error if it's not from an aborted request
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Error performing search:", error);
        }
      }
    },
    [dispatch, selectedProject?.isSearchForAll],
  );

  // Handle search input changes
  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const query = event.target.value;
    setSearchQuery(query);
  };

  const handleSearchClick = async () => {
    if (searchQuery) {
      dispatch(
        setLocalPageLock({
          documentId: activeDocument?.id,
          lockedPage: -1,
          isActive: true,
        }),
      );

      await dispatch(
        updateProject({
          payload: { recentSearch: searchQuery, isSearched: true },
        }),
      );
      await dispatch(
        updateDocument({
          documentId: activeDocument?.id,
          projectId: selectedProject?.id as string,
          payload: { lockedPage: -1, isActive: true },
        }),
      );
    }
  };

  const handleKeyPress = async (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter" && searchQuery?.trim()) {
      if (searchQuery.trim() !== (selectedProject?.recentSearch ?? "").trim()) {
        dispatch(
          setLocalPageLock({
            documentId: activeDocument?.id,
            lockedPage: -1,
            isActive: true,
          }),
        );

        dispatch(searchResultsReset());
        handleSearch(searchQuery);
        try {
          await dispatch(
            updateProject({
              payload: { recentSearch: searchQuery.trim(), isSearched: true },
            }),
          );
          await dispatch(
            updateDocument({
              documentId: activeDocument?.id,
              projectId: selectedProject?.id as string,
              payload: { lockedPage: -1, isActive: true },
            }),
          );
        } catch (error) {
          console.error("Error saving search:", error);
        }
      }
    }
  };

  // Clear search input and results
  const handleClearInput = () => {
    setSearchQuery("");
    dispatch(
      updateProject({
        payload: { recentSearch: "", isSearched: false, isSearchForAll: false },
      }),
    );
  };

  // Toggle search scope between current and all sources
  const handleToggleSearchForAll = async () => {
    const newValue = !selectedProject?.isSearchForAll;
    await dispatch(
      updateDocument({
        documentId: activeDocument?.id,
        projectId: selectedProject?.id as string,
        payload: { lockedPage: -1, isActive: true },
      }),
    );

    if (newValue) {
      await dispatch(
        updateProject({
          payload: { isSearchForAll: newValue, isSearched: true },
        }),
      );
      if (searchQuery) {
        handleSearch(searchQuery, newValue);
      }
    } else {
      await dispatch(
        updateProject({
          payload: { isSearchForAll: newValue },
        }),
      );
    }
  };

  return (
    <div className="relative flex w-full items-center justify-center">
      <div className="relative">
        <div
          className={`flex h-9 w-[508px] items-center rounded border-[1.5px] border-[#eaf0fc] bg-white p-2 gap-2 transition-all hover:shadow-[1px_2px_4px_0px_rgba(0,76,230,0.05)] ${
            searchQuery ? "border-[#004CE6]" : ""
          } focus-within:border-[#004CE6]`}
        >
          <Image
            src={searchQuery ? SearchIcon : InActiveSearch}
            alt="Search"
            className={`bg-transparent ${(!searchResults[sanitizedName(activeDocument?.url?.split("/").pop().split(".")[0])] || isSearchLoading) ? 'opacity-50' : ''}`}
          />
          <input
            type="text"
            placeholder="What are you looking for?"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleKeyPress}
            onClick={handleSearchClick}
            disabled={isSearchLoading}
            className={`flex-1 border-none bg-white text-base font-normal leading-5 text-[#001742] outline-none placeholder:text-[#9babc7] min-h-[24px] max-h-[24px] ${(isSearchLoading) ? 'opacity-50' : ''}`}
          />
          {searchQuery && !isSearchLoading && (
            <button
              className="flex items-center justify-center bg-transparent"
              onClick={handleClearInput}
              aria-label="Clear search"
            >
              <Image src={Clear} alt="Clear" className="cursor-pointer" />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 flex items-center space-x-2 whitespace-nowrap">
            <Switch
              id="search-scope"
              onClick={handleToggleSearchForAll}
              checked={selectedProject?.isSearchForAll}
            />
            <Label htmlFor="search-scope" className="text-[#4E5971] text-sm">
              All Sources
            </Label>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchField;