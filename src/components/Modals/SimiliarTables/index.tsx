"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
// Images
import SimiliarTableIcon from '../../../../public/images/Frame 1000004460.svg';
import Excelcon from '../../../../public/images/excelIcon.svg';
// Redux
import { RootState, AppDispatch } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { setIsSimilarTablesOpen } from "@/redux/modals/similarTables/similarTablesSlice";
import { selectTableChunks } from '@/redux/chunks/selector';
import { fetchSimilarTables, fetchPreviewData } from "@/redux/modals/similarTables/similarTablesThunks";
// Components
import PrimaryTable from "./PrimaryTable";
import SecondaryTable from "./SecondaryTable";
import CombinedTable from "./CombinedTable";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// Utils
import { findSectionIndex } from "@/utils/utils";
// Interfaces
import {
    SimilarTableData,
    SelectedTable,
    SelectedDocument,
    ProcessedTableData,
    CombinedTablesPayload,
    CombinedTableItem
} from "@/redux/modals/similarTables/similiartable.interface";

export function SimiliarTables() {
    const dispatch = useDispatch<AppDispatch>();

    // Redux Selectors - Core Data
    const {
        isSimilarTablesOpen,
        tableId,
        currentPage,
        similarTablesState,
        activeDocument,
        projectSelectedDocuments,
        companyDocuments,
        tableChunksData,
        previewData
    } = useSelector((state: RootState) => ({
        isSimilarTablesOpen: state.similarTables.isSimilarTablesOpen,
        tableId: state.similarTables.tableId,
        currentPage: state.similarTables.currentPage,
        similarTablesState: state.similarTables.similarTables || {},
        activeDocument: state.projectDocuments.activeDocument,
        projectSelectedDocuments: state.projectDocuments.selectedDocuments,
        companyDocuments: state.documents.documentLists,
        tableChunksData: selectTableChunks(state),
        previewData: state.similarTables.previewData
    }));

    // Local State Management
    const [activeTab, setActiveTab] = useState<string>("primary-table");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Table Selection State
    const [selectedTables, setSelectedTables] = useState<SelectedTable[]>([]);
    const [selectedDocumentsList, setSelectedDocumentsList] = useState<SelectedDocument[]>([]);

    // Similar Tables Data State - using ProcessedTableData for UI
    const [primaryTableData, setPrimaryTableData] = useState<ProcessedTableData | null>(null);
    const [similarTablesData, setSimilarTablesData] = useState<ProcessedTableData[]>([]);
    const [similarTablesByYear, setSimilarTablesByYear] = useState<{ [year: string]: ProcessedTableData[] }>({});
    const { sections } = useSelector((state: RootState) => state.documents);

    // UI State
    const [showSimilarTables, setShowSimilarTables] = useState(false);
    const [selectedSecondaryTableId, setSelectedSecondaryTableId] = useState<string | number | null>(null);
    const [selectedTablesByDocument, setSelectedTablesByDocument] = useState<{ [docId: number]: string | number }>({});

    // Preview Data Loading State
    const [isPreviewDataLoading, setIsPreviewDataLoading] = useState(false);

    // Computed Values
    const hasActiveDocument = Boolean(activeDocument);
    const hasCompanyDocuments = Boolean(companyDocuments[activeDocument?.companyName]?.length);
    const hasSelectedTables = selectedTables.length > 1 || (selectedTables.length === 1 && selectedTables[0].id !== activeDocument?.id);
    const isDataLoaded = Boolean(primaryTableData || similarTablesData.length > 0);

    // Memoized company documents for current company
    const currentCompanyDocuments = useMemo(() => {
        return companyDocuments[activeDocument?.companyName] || [];
    }, [companyDocuments, activeDocument?.companyName]);

    // Memoized filtered company documents (excluding active document) sorted by year descending
    const filteredCompanyDocuments = useMemo(() => {
        const filtered = currentCompanyDocuments.filter((doc: any) => doc.name !== activeDocument?.name);

        // Sort by year in descending order
        return filtered.sort((a: any, b: any) => {
            const yearA = parseInt(a.year) || 0;
            const yearB = parseInt(b.year) || 0;
            return yearB - yearA; // Descending order
        });
    }, [currentCompanyDocuments, activeDocument?.name]);

    // Memoized competitor URLs
    const competitorUrls = useMemo(() => {
        return currentCompanyDocuments
            ?.filter((doc: any) => doc.url !== activeDocument?.url)
            .map((doc: any) => doc.url) || [];
    }, [currentCompanyDocuments, activeDocument?.url]);

    // Initialize primary table data from table chunks
    const initializePrimaryTableData = useCallback(() => {
        try {
            if (!activeDocument || !tableChunksData[activeDocument.id]?.[currentPage]) {
                return;
            }

            const pageTableData = tableChunksData[activeDocument.id][currentPage];
            const currentTable = pageTableData.find((table: any) => table.table_id === tableId);

            if (currentTable) {
                setPrimaryTableData({
                    title: currentTable.title || "Primary Table",
                    table_html: currentTable.table_html || [],
                    table_id: currentTable.table_id,
                    page_number: currentTable.page_number || currentPage,
                    description: currentTable.description,
                    table_without_caption: currentTable.table_without_caption
                });

                // Initialize selected tables with primary table
                const primarySelection: SelectedTable = {
                    id: activeDocument.id,
                    blobUrl: activeDocument.url,
                    pageNumber: currentPage,
                    tableId: tableId,
                    year: activeDocument.year,
                    documentType: activeDocument.documentType,
                    table_without_caption: currentTable.table_without_caption || ""
                };

                setSelectedTables([primarySelection]);
                setSelectedDocumentsList([{
                    id: activeDocument.id,
                    url: activeDocument.url,
                    year: activeDocument.year,
                    documentType: activeDocument.documentType
                }]);
            }
        } catch (err) {
            console.error('Error initializing primary table data:', err);
            setError('Failed to load primary table data');
        }
    }, [activeDocument, tableChunksData, currentPage, tableId]);

    // Fetch similar tables from API
    const fetchSimilarTablesData = useCallback(async () => {
        if (!activeDocument || !hasCompanyDocuments || competitorUrls.length === 0) {
            return;
        }

        setIsLoading(true);
        setError(null);

        const payload = {
            sourceUrl: activeDocument.url,
            tableId: tableId,
            pageNumber: currentPage || 0,
            compatiorUrls: competitorUrls,
        }

        try {
            await dispatch(fetchSimilarTables(payload));
        } catch (err) {
            console.error('Error fetching similar tables:', err);
            setError('Failed to fetch similar tables');
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, activeDocument, hasCompanyDocuments, competitorUrls, tableId, currentPage]);

    // Process and categorize similar tables data by year
    const processSimilarTablesData = useCallback(() => {
        try {
            const tablesData = similarTablesState[tableId]?.data;
            if (!tablesData || !activeDocument) return;

            const tablesByYear: { [year: string]: ProcessedTableData[] } = {};

            // Process the nested structure from API response
            Object.entries(tablesData).forEach(([companyName, companyData]: [string, any]) => {
                if (typeof companyData === 'object' && companyData !== null) {
                    Object.entries(companyData).forEach(([docType, docTypeData]: [string, any]) => {
                        if (typeof docTypeData === 'object' && docTypeData !== null) {
                            Object.entries(docTypeData).forEach(([year, yearData]: [string, any]) => {
                                if (Array.isArray(yearData)) {
                                    const processedTables: ProcessedTableData[] = yearData.map((table: SimilarTableData) => ({
                                        title: table.title || 'Untitled Table',
                                        table_html: table.html ? [table.html] : [],
                                        table_id: table.table_id,
                                        page_number: table.page_number || 0,
                                        description: table.description,
                                        table_without_caption: table.table_url
                                    }));

                                    if (!tablesByYear[year]) {
                                        tablesByYear[year] = [];
                                    }
                                    tablesByYear[year].push(...processedTables);
                                }
                            });
                        }
                    });
                }
            });

            console.log('Processed tables by year:', tablesByYear);
            setSimilarTablesByYear(tablesByYear);
            setShowSimilarTables(true);

        } catch (err) {
            console.error('Error processing similar tables data:', err);
            setError('Failed to process similar tables data');
        }
    }, [similarTablesState, tableId, activeDocument]);

    // Get tables for specific year
    const getTablesForYear = useCallback((year: string) => {
        const yearTables = similarTablesByYear[year] || [];
        const bestMatch = yearTables.length > 0 ? yearTables[0] : null;
        const otherMatches = yearTables.slice(1);

        return { bestMatch, otherMatches };
    }, [similarTablesByYear]);

    // Handle document selection - only changes tab, doesn't affect checkbox
    const handleDocumentSelection = useCallback((docId: number) => {
        setActiveTab(`doc-${docId}`);
    }, []);

    // Handle checkbox selection - only affects checkbox and table selection
    const handleCheckboxClick = useCallback((e: React.MouseEvent, docId: number) => {
        e.stopPropagation(); // Prevent tab change when clicking checkbox
        
        const selectedDoc = currentCompanyDocuments.find((doc: any) => doc.id === docId);
        if (!selectedDoc) return;

        const isCurrentlySelected = selectedDocumentsList.some((selectedDoc) => selectedDoc.id === docId);
        
        if (!isCurrentlySelected) {
            // Add document to selection
            const docSelection: SelectedDocument = {
                id: docId,
                url: selectedDoc.url,
                year: selectedDoc.year,
                documentType: selectedDoc.documentType
            };

            setSelectedDocumentsList(prev => {
                const exists = prev.some(doc => doc.id === docId);
                return exists ? prev : [...prev, docSelection];
            });

            // Automatically select the best match for this year
            const { bestMatch } = getTablesForYear(selectedDoc.year);
            if (bestMatch) {
                const bestMatchSelection: SelectedTable = {
                    id: docId,
                    blobUrl: selectedDoc.url,
                    pageNumber: bestMatch.page_number,
                    tableId: bestMatch.table_id,
                    year: selectedDoc.year,
                    documentType: selectedDoc.documentType,
                    table_without_caption: bestMatch.table_without_caption || ""
                };

                setSelectedTables(prev => {
                    const exists = prev.some(table =>
                        table.id === docId && table.tableId === bestMatch.table_id
                    );
                    return exists ? prev : [...prev, bestMatchSelection];
                });

                // Update selected tables by document
                setSelectedTablesByDocument(prev => ({
                    ...prev,
                    [docId]: bestMatch.table_id
                }));
            }
        } else {
            // Remove document from selection
            setSelectedDocumentsList(prev => prev.filter(doc => doc.id !== docId));

            // Remove all tables from this document
            setSelectedTables(prev => prev.filter(table => table.id !== docId));

            // Remove from selected tables by document
            setSelectedTablesByDocument(prev => {
                const newState = { ...prev };
                delete newState[docId];
                return newState;
            });
        }
    }, [currentCompanyDocuments, getTablesForYear, selectedDocumentsList]);

    // Handle document checkbox change (for backward compatibility)
    const handleDocumentCheckboxChange = useCallback((docId: number, checked: boolean) => {
        const selectedDoc = currentCompanyDocuments.find((doc: any) => doc.id === docId);
        if (!selectedDoc) return;

        if (checked) {
            // Add document to selection
            const docSelection: SelectedDocument = {
                id: docId,
                url: selectedDoc.url,
                year: selectedDoc.year,
                documentType: selectedDoc.documentType
            };

            setSelectedDocumentsList(prev => {
                const exists = prev.some(doc => doc.id === docId);
                return exists ? prev : [...prev, docSelection];
            });

            // Automatically select the best match for this year
            const { bestMatch } = getTablesForYear(selectedDoc.year);
            if (bestMatch) {
                const bestMatchSelection: SelectedTable = {
                    id: docId,
                    blobUrl: selectedDoc.url,
                    pageNumber: bestMatch.page_number,
                    tableId: bestMatch.table_id,
                    year: selectedDoc.year,
                    documentType: selectedDoc.documentType,
                    table_without_caption: bestMatch.table_without_caption || ""
                };

                setSelectedTables(prev => {
                    const exists = prev.some(table =>
                        table.id === docId && table.tableId === bestMatch.table_id
                    );
                    return exists ? prev : [...prev, bestMatchSelection];
                });

                // Update selected tables by document
                setSelectedTablesByDocument(prev => ({
                    ...prev,
                    [docId]: bestMatch.table_id
                }));
            }
        } else {
            // Remove document from selection
            setSelectedDocumentsList(prev => prev.filter(doc => doc.id !== docId));

            // Remove all tables from this document
            setSelectedTables(prev => prev.filter(table => table.id !== docId));

            // Remove from selected tables by document
            setSelectedTablesByDocument(prev => {
                const newState = { ...prev };
                delete newState[docId];
                return newState;
            });
        }
    }, [currentCompanyDocuments, getTablesForYear]);

    // Handle table selection for secondary tables
    const handleTableSelection = useCallback((
        docId: number,
        tableId: string | number,
        blobUrl: string,
        pageNumber: number,
        year: string,
        documentType: string,
        table_without_caption: string
    ) => {
        // Ensure the document is selected when a table is selected
        const selectedDoc = currentCompanyDocuments.find((doc: any) => doc.id === docId);
        if (selectedDoc) {
            const docSelection: SelectedDocument = {
                id: docId,
                url: selectedDoc.url,
                year: selectedDoc.year,
                documentType: selectedDoc.documentType
            };

            setSelectedDocumentsList(prev => {
                const exists = prev.some(doc => doc.id === docId);
                return exists ? prev : [...prev, docSelection];
            });
        }

        setSelectedTables(prevTables => {
            const existingIndex = prevTables.findIndex(
                table => table.id === docId && table.tableId === tableId
            );

            if (existingIndex !== -1) {
                // Remove if already selected
                const newTables = prevTables.filter((_, index) => index !== existingIndex);
                
                // Update selected tables by document
                setSelectedTablesByDocument(prev => {
                    const newState = { ...prev };
                    if (newTables.filter(table => table.id === docId).length === 0) {
                        delete newState[docId];
                    }
                    return newState;
                });
                
                return newTables;
            } else {
                // Add new selection
                const newTable: SelectedTable = {
                    id: docId,
                    blobUrl,
                    pageNumber,
                    tableId,
                    year,
                    documentType,
                    table_without_caption
                };
                
                // Update selected tables by document
                setSelectedTablesByDocument(prev => ({
                    ...prev,
                    [docId]: tableId
                }));
                
                return [...prevTables, newTable];
            }
        });

        setSelectedSecondaryTableId(prev => prev === tableId ? null : tableId);
    }, [currentCompanyDocuments]);

    // Handle tab change
    const handleTabChange = useCallback((value: string) => {
        setActiveTab(value);

        // If combined table tab is selected, fetch preview data
        if (value === "combined-table" && selectedTables.length > 0) {
            handleFetchPreviewData();
        }
    }, [selectedTables.length]);

    // Handle fetch preview data
    const handleFetchPreviewData = useCallback(async () => {
        if (selectedTables.length === 0 || !activeDocument) return;

        setIsPreviewDataLoading(true);
        setError(null);

        try {
            // Build payload with all selected tables (primary + all secondary tables)
            const payloadTables = [];

            // Add primary table data if it exists in selected tables
            const primaryTable = selectedTables.find(table => table.id === activeDocument.id);
            if (primaryTable) {
                payloadTables.push({
                    id: primaryTable.id,
                    blob_url: primaryTable.blobUrl,
                    page_number: primaryTable.pageNumber,
                    table_id: primaryTable.tableId.toString(),
                    year: parseInt(primaryTable.year),
                    document_type: primaryTable.documentType
                });
            }

            // Add all selected secondary tables
            const secondaryTables = selectedTables.filter(table => table.id !== activeDocument.id);
            secondaryTables.forEach(table => {
                payloadTables.push({
                    id: table.id,
                    blob_url: table.blobUrl,
                    page_number: table.pageNumber,
                    table_id: table.tableId.toString(),
                    year: parseInt(table.year),
                    document_type: table.documentType
                });
            });

            if (payloadTables.length === 0) {
                throw new Error('No tables selected');
            }

            console.log('Sending payload with tables:', payloadTables);

            // Build payload according to CombinedTablesPayload interface
            const payload: CombinedTablesPayload = {
                tables: payloadTables
            };

            await dispatch(fetchPreviewData(payload));
        } catch (err) {
            console.error('Error fetching preview data:', err);
            setError('Failed to fetch preview data');
        } finally {
            setIsPreviewDataLoading(false);
        }
    }, [dispatch, selectedTables, activeDocument]);

    // Handle modal close
    const handleClose = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(setIsSimilarTablesOpen(false));

        // Reset state when closing
        setActiveTab("primary-table");
        setSelectedTables([]);
        setSelectedDocumentsList([]);
        setSimilarTablesData([]);
        setSimilarTablesByYear({});
        setPrimaryTableData(null);
        setError(null);
        setSelectedSecondaryTableId(null);
        setSelectedTablesByDocument({});
        setShowSimilarTables(false);
        setIsPreviewDataLoading(false);
    }, [dispatch]);

    // Initialize primary table data when modal opens
    useEffect(() => {
        if (isSimilarTablesOpen && activeDocument && tableId && currentPage !== undefined) {
            initializePrimaryTableData();
        }
    }, [isSimilarTablesOpen, activeDocument, tableId, currentPage, tableChunksData, initializePrimaryTableData]);

    // Fetch similar tables when modal opens and data is not cached
    useEffect(() => {
        if (isSimilarTablesOpen && activeDocument && tableId && !similarTablesState[tableId]) {
            fetchSimilarTablesData();
        }
    }, [isSimilarTablesOpen, activeDocument, tableId, similarTablesState, hasCompanyDocuments, competitorUrls, fetchSimilarTablesData]);

    // Process similar tables data when it's loaded
    useEffect(() => {
        if (similarTablesState[tableId]?.data && !similarTablesState[tableId]?.loading) {
            processSimilarTablesData();
        }
    }, [similarTablesState, tableId, processSimilarTablesData]);

    // Early returns for various states
    if (!isSimilarTablesOpen) {
        return null;
    }

    if (!hasActiveDocument) {
        return null;
    }

    if (!hasCompanyDocuments) {
        return (
            <div className="fixed inset-0 bg-[#0026731A]/30 backdrop-blur-sm z-50" onClick={handleClose}>
            <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-[1400px]" onClick={(e) => e.stopPropagation()}>
                <div className="bg-[#f5f7fa] rounded-lg h-[750px] flex flex-col">

                    {/* Header */}
                    <header className="flex items-center rounded-t-lg justify-between h-[40px] w-full bg-white border-b border-[#eaf0fc] p-2.5">
                        <div className="flex items-center gap-2">
                            <Image src={SimiliarTableIcon} alt="Similar Table Icon" width={24} height={24} />
                            <h2 className="text-lg font-medium text-text-primary">Export similar tables</h2>
                        </div>
                        <X size={20} className='text-text-primary cursor-pointer' onClick={handleClose} />
                    </header>

                    <main className="flex-1 overflow-hidden h-full w-full rounded-b-lg">
                        <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                            <Loader2 className="w-8 h-8 text-[#004CE6] animate-spin" />
                            <p className="text-gray-600 text-lg">Searching company documents</p>
                        </div>
                    </main>

                </div>
            </div>
        </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#0026731A]/30 backdrop-blur-sm z-50" onClick={handleClose}>
            <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-[1400px]" onClick={(e) => e.stopPropagation()}>
                <div className="bg-[#f5f7fa] rounded-lg h-[750px] flex flex-col">

                    {/* Header */}
                    <header className="flex items-center rounded-t-lg justify-between h-[40px] w-full bg-white border-b border-[#eaf0fc] p-2.5">
                        <div className="flex items-center gap-2">
                            <Image src={SimiliarTableIcon} alt="Similar Table Icon" width={24} height={24} />
                            <h2 className="text-lg font-medium text-text-primary">Export similar tables</h2>
                        </div>
                        <X size={20} className='text-text-primary cursor-pointer' onClick={handleClose} />
                    </header>

                    {/* Error State */}
                    {error && (
                        <div className="px-4 py-2 bg-red-50 border-l-4 border-red-400 text-red-700">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Main Content */}
                    <main className="flex-1 overflow-hidden h-full w-full rounded-b-lg">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex items-center justify-start w-full h-full bg-white">

                            <TabsList className="w-[20%] p-2 h-full bg-[#FAFCFF] border-r border-[#eaf0fc] rounded-none flex flex-col items-center justify-start gap-2.5">
                                <TabsTrigger
                                    value="primary-table"
                                    className="w-full border !border-[#eaf0fc] text-[#001742] hover:!border-[#DEE6F5] bg-white hover:bg-white p-2 flex items-center justify-between shadow-custom-blue data-[state=active]:!border-[#004CE6] data-[state=active]:!border"
                                >
                                    {activeDocument?.name
                                        .replace(/[^a-zA-Z0-9\s]/g, " ")
                                        .toUpperCase() || `Primary Document`}
                                    <span className="text-[#004CE6] text-xs">Primary</span>
                                </TabsTrigger>

                                {filteredCompanyDocuments.map((doc: any) => (
                                    <TabsTrigger
                                        key={doc.id}
                                        value={`doc-${doc.id}`}
                                        disabled={!hasCompanyDocuments || isLoading}
                                        className="w-full h-[38px] border !border-[#eaf0fc] bg-white hover:bg-white hover:!border-[#DEE6F5] p-2 flex !items-center justify-between hover:shadow-custom-blue disabled:opacity-50 data-[state=active]:!border-[#004CE6] data-[state=active]:!border data-[state=disabled]:cursor-not-allowed"
                                        onClick={() => handleDocumentSelection(doc.id)}
                                    >
                                        <div className="flex flex-col items-start text-left">
                                            {doc.name.replace(/[^a-zA-Z0-9\s]/g, " ").toUpperCase()}
                                        </div>
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 text-[#004CE6] animate-spin" />
                                        ) : (
                                            <div onClick={(e) => handleCheckboxClick(e, doc.id)}>
                                                <Checkbox
                                                    className="h-[16px] w-[16px] mt-[2px] border-border-primary data-[state=checked]:!border-[#004CE6] data-[state=checked]:!bg-[#004CE6] data-[state=checked]:!text-white data-[state=checked]:!opacity-100 disabled:cursor-not-allowed"
                                                    checked={selectedDocumentsList.some((selectedDoc) => selectedDoc.id === doc.id)}
                                                    onCheckedChange={(checked) => handleDocumentCheckboxChange(doc.id, checked as boolean)}
                                                />
                                            </div>
                                        )}
                                    </TabsTrigger>
                                ))}

                                <TabsTrigger
                                    value="combined-table"
                                    className="w-full h-[38px] border !border-[#eaf0fc] text-[#001742] bg-white hover:bg-white p-2 flex items-center justify-center gap-2"
                                    disabled={!hasSelectedTables}
                                >
                                    {isPreviewDataLoading ? (
                                        <Loader2 className="w-4 h-4 text-[#004CE6] animate-spin" />
                                    ) : (
                                        <Image src={Excelcon} alt="Excel Icon" width={24} height={24} />
                                    )}
                                    {isPreviewDataLoading ? "Combining selected tables" : "Combine selected tables"}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="primary-table" className="w-[80%] h-full bg-white m-0 px-4 py-3 overflow-y-auto scrollbar-hide">
                                <PrimaryTable
                                    primaryTableData={primaryTableData}
                                    primaryTableImage={primaryTableData?.table_without_caption || ""}
                                />
                            </TabsContent>

                            {filteredCompanyDocuments.map((doc: any) => {
                                const { bestMatch, otherMatches } = getTablesForYear(doc.year);
                                const isDocumentSelected = selectedDocumentsList.some((selectedDoc) => selectedDoc.id === doc.id);
                                const hasSelectedTableFromThisDoc = selectedTables.some(table => table.id === doc.id);
                                const selectedTableId = selectedTablesByDocument[doc.id];

                                return (
                                    <TabsContent
                                        key={doc.id}
                                        value={`doc-${doc.id}`}
                                        className="w-[80%] h-full bg-white m-0 overflow-hidden"
                                    >
                                        <SecondaryTable
                                            bestMatchTable={bestMatch || {}}
                                            otherMatches={otherMatches || []}
                                            isDocumentSelected={isDocumentSelected}
                                            hasSelectedTableFromThisDoc={hasSelectedTableFromThisDoc}
                                            selectedTableId={selectedTableId}
                                            onTabChange={(value) => {
                                                if (value === 'best-match' && bestMatch) {
                                                    handleTableSelection(
                                                        doc.id,
                                                        bestMatch.table_id,
                                                        doc.url,
                                                        bestMatch.page_number,
                                                        doc.year,
                                                        doc.documentType,
                                                        bestMatch.table_without_caption || ""
                                                    );
                                                } else if (value.startsWith('other-match-')) {
                                                    const tableId = value.replace('other-match-', '');
                                                    const selectedMatch = otherMatches.find((match: any) => match.table_id === tableId);
                                                    if (selectedMatch) {
                                                        handleTableSelection(
                                                            doc.id,
                                                            selectedMatch.table_id,
                                                            doc.url,
                                                            selectedMatch.page_number,
                                                            doc.year,
                                                            doc.documentType,
                                                            selectedMatch.table_without_caption || ""
                                                        );
                                                    }
                                                }
                                            }}
                                        />
                                    </TabsContent>
                                );
                            })}

                            <TabsContent value="combined-table" className="w-[80%] h-full bg-white m-0 overflow-y-auto scrollbar-hide">
                                <CombinedTable />
                            </TabsContent>

                        </Tabs>
                    </main>

                </div>
            </div>
        </div>
    );
}