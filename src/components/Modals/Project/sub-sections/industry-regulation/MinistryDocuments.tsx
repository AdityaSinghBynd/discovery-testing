import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "@/constant/constant";
import { getSession } from "next-auth/react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setSelectedProjectDocuments } from '@/redux/projectDocuments/projectDocumentsSlice';

interface MinistryDocumentsProps {
  ministry: any; // Replace 'any' with a more specific type for ministry
  onBack: () => void;
  type: "governments" | "private";
}

// Helper function to prettify document names (capitalize each word, replace underscores)
function prettifyDocumentName(name: string) {
  return name
    .split("_")
    .filter(Boolean)
    .map((word: string) => {
      // If word is all uppercase (like "AMR"), keep as is, else capitalize
      if (word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

const getDocumentKey = (doc: any, idx: number) => doc.id || doc.documentId || idx;

// Document is selectable for all statuses except 'failed'
const isDocumentActive = (doc: any) => {
  const status = (doc.status || '').toLowerCase();
  return status !== 'failed';
};

const MinistryDocuments: React.FC<MinistryDocumentsProps> = ({ ministry, onBack, type }) => {
  const dispatch = useDispatch();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Checkbox state: Set of selected document keys
  const selectedDocs = useSelector(
    (state: RootState) => state.projectDocuments.selectedDocuments,
  );

  // Keep selectedDocs in sync with Redux selectedDocuments
  useEffect(() => {
    // If selectedDocuments are from this ministry, sync them
    const keys = new Set(
      selectedDocs
        .map((doc: any, idx: number) => getDocumentKey(doc, idx))
        .filter(Boolean)
    );
  }, [selectedDocs]);

  useEffect(() => {
    const fetchMinistryDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const session = await getSession();
        const token = session?.accessToken;
        // Use ministry.id to fetch documents for the selected ministry
        const res = await axios.get(
          `${BASE_URL}/${type}-reports/${type === "governments" ? "ministries" : "private-bodies"}/${ministry.id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (res.status !== 200) throw new Error("Failed to fetch ministry documents");
        // The API returns an array of objects, each with a 'documents' property
        // Flatten to just the 'documents' array
        const data = Array.isArray(res.data) ? res.data : [];
        // If the API returns [{documents: [...]}, ...], flatten to a single array of docs
        const docs = data
          .map((item: any) => item.documents)
          .filter(Boolean)
          .flat();
        setDocuments(docs);
      } catch (err: any) {
        setError(err.message || "Error fetching ministry documents");
      } finally {
        setLoading(false);
      }
    };

    if (ministry?.id) {
      fetchMinistryDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ministry]);

  // Checkbox logic
  const handleCheckboxChange = useCallback(
    (key: string | number, doc: any) => {
      if (!isDocumentActive(doc)) return; // Prevent interaction if not active
      // Check if the document is already selected
      const isSelected = selectedDocs.some(
        (selectedDoc: any) => selectedDoc.id === (doc.id || doc.documentId || key)
      );
      // If selected, remove it; if not, add it
      console.log("doc========in ministry documents", doc);
      dispatch(
        setSelectedProjectDocuments({
          id: doc.id || doc.documentId || key,
          name: doc.name || doc.title,
          remove: isSelected,
          status: doc.status || "", // pass a flag to reducer to remove if already selected
        })
      );
    },
    [dispatch, selectedDocs]
  );

  // "Select All" logic
  const allKeys = documents.map(getDocumentKey);
  // Only consider selectable documents for "allSelected"
  const selectableDocs = documents.filter(isDocumentActive);
  const selectableKeys = selectableDocs.map(getDocumentKey);
  const allSelected =
    selectableKeys.length > 0 &&
    selectableKeys.every((key) =>
      selectedDocs.some((doc: any) => doc.id === key)
    );
  const someSelected = selectableKeys.some((key) =>
    selectedDocs.some((doc: any) => doc.id === key)
  );

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      // Deselect all (only those that are selectable)
      selectableDocs.forEach((doc: any, idx: number) => {
        const key = getDocumentKey(doc, idx);
        if (selectedDocs.some((d: any) => d.id === key)) {
          console.log("doc========in ministry documents", doc);
          dispatch(
            setSelectedProjectDocuments({
              id: doc.id || doc.documentId || key,
              name: doc.name || doc.title,
              remove: true,
              status: doc.status || "",
            })
          );
        }
      });
    } else {
      // Select all (only those that are selectable)
      selectableDocs.forEach((doc: any, idx: number) => {
        const key = getDocumentKey(doc, idx);
        if (!selectedDocs.some((d: any) => d.id === key)) {
          console.log("doc========in ministry documents", doc);
          dispatch(
            setSelectedProjectDocuments({
              id: doc.id || doc.documentId || key,
              name: doc.name || doc.title,
              remove: false,
              status: doc.status || "",
            })
          );
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSelected, selectableDocs, dispatch, selectedDocs]);

  // Helper to prettify ministry name: capitalize first letter, keep rest as is
  function prettifyMinistryName(name: string) {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  // Helper to check if document is idle
  function isDocumentIdle(doc: any) {
    const status = (doc.status || '').toLowerCase();
    return status === 'idle';
  }

  // Helper to check if document is loading
  function isDocumentLoading(doc: any) {
    const status = (doc.status || '').toLowerCase();
    return status === 'loading';
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 px-3 py-1 rounded text-[#001742] font-medium text-base transition-all duration-300"
        style={{
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
        }}
      >
        <ArrowLeft size={18} className="inline-block" />
        <Building2 size={18} className="inline-block" />
        <p className="text-base">
          {ministry.name
            ? prettifyMinistryName(ministry.name).replaceAll(/_/g, " ")
            : ""}
        </p>
      </button>
      <div>
        {loading ? (
          <div className="p-4 text-sm text-[#4e5971] flex items-center gap-2">
            <Loader2 className="animate-spin h-4 w-4 mr-2" />
            Loading documents...
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-500">{error}</div>
        ) : documents.length > 0 ? (
          <div>
            <div className="flex items-center px-4 py-2 border-b border-[#eaf0fc] bg-[#f8fafc]">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = !allSelected && someSelected;
                }}
                onChange={handleSelectAll}
                className="mr-2"
                id="select-all-documents"
                // Disable if no selectable docs
                disabled={selectableDocs.length === 0}
              />
              <label
                htmlFor="select-all-documents"
                className={`text-sm text-[#001742] font-medium cursor-pointer ${selectableDocs.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Select All
              </label>
            </div>
            {/* Make the document list scrollable */}
            <div
              style={{
                maxHeight: '400px',
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                background: 'white'
              }}
              className="scrollbar-thin scrollbar-thumb-[#eaf0fc] scrollbar-track-[#f8fafc]"
            >
              <ul className="divide-y divide-[#eaf0fc] bg-white">
                {documents.map((doc: any, idx: number) => {
                  const key = getDocumentKey(doc, idx);
                  const isChecked = selectedDocs.some(
                    (document: any) => document.id === (doc.id || doc.documentId || key)
                  );
                  const isActive = isDocumentActive(doc);
                  const isIdle = isDocumentIdle(doc);
                  const isLoadingDoc = isDocumentLoading(doc);
                  return (
                    <li
                      key={key}
                      className={`flex items-center px-4 py-2 text-sm text-[#001742] ${
                        !isActive
                          ? 'opacity-80 blur-[1px] pointer-events-none select-none'
                          : ''
                      }`}
                      // pointer-events-none disables all interaction, select-none disables text selection
                    >
                      {isLoadingDoc ? (
                        <Loader2 className="animate-spin h-4 w-4 mr-3 text-[#3b82f6]" aria-label="Loading document" />
                      ) : (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(key, doc)}
                          className="mr-3"
                          id={`doc-checkbox-${key}`}
                          disabled={!isActive}
                        />
                      )}
                      <label
                        htmlFor={`doc-checkbox-${key}`}
                        className={`flex-1 ${!isActive ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {doc.name
                          ? prettifyDocumentName(doc.name)
                          : doc.title
                          ? prettifyDocumentName(doc.title)
                          : "Untitled Document"}
                        {isIdle && (
                          <span className="ml-2 text-xs text-[#f59e42] bg-[#fff7ed] px-2 py-0.5 rounded">
                            Not processed
                          </span>
                        )}
                        {isLoadingDoc && (
                          <span className="ml-2 text-xs text-[#3b82f6] bg-[#e0f2fe] px-2 py-0.5 rounded">
                            Processing
                          </span>
                        )}
                        {!isActive && (
                          <span className="ml-2 text-xs text-[#b91c1c]">(Unavailable)</span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-4 text-sm text-[#4e5971]">
            No documents found for this ministry.
          </div>
        )}
      </div>
    </div>
  );
};

export default MinistryDocuments;