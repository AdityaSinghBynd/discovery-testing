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
import { fetchSimilarTables } from "@/redux/similarTables/similarTablesSlice";
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
    ProcessedTableData 
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
        tableChunksData
    } = useSelector((state: RootState) => ({
        isSimilarTablesOpen: state.similarTables.isSimilarTablesOpen,
        tableId: state.similarTables.tableId,
        currentPage: state.similarTables.currentPage,
        similarTablesState: state.similarTable?.similarTables || {},
        activeDocument: state.projectDocuments.activeDocument,
        projectSelectedDocuments: state.projectDocuments.selectedDocuments,
        companyDocuments: state.documents.documentLists,
        tableChunksData: selectTableChunks(state)
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
    const [similarTablesByYear, setSimilarTablesByYear] = useState<{[year: string]: ProcessedTableData[]}>({});
    const {sections} = useSelector((state: RootState) => state.documents);

    // UI State
    const [showSimilarTables, setShowSimilarTables] = useState(false);
    const [selectedSecondaryTableId, setSelectedSecondaryTableId] = useState<string | number | null>(null);

    // Computed Values
    const hasActiveDocument = Boolean(activeDocument);
    const hasCompanyDocuments = Boolean(companyDocuments[activeDocument?.companyName]?.length);
    const hasSelectedTables = selectedTables.length > 1;
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
    }, [dispatch, activeDocument, hasCompanyDocuments, competitorUrls, tableId, currentPage, companyDocuments]);

    // Process and categorize similar tables data by year
    const processSimilarTablesData = useCallback(() => {
        try {
            const tablesData = similarTablesState[tableId]?.data;
            if (!tablesData || !activeDocument) return;

            const tablesByYear: {[year: string]: ProcessedTableData[]} = {};

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

    // Handle table selection for secondary tables
    const handleTableSelection = useCallback((
        docId: number,
        tableId: string | number,
        blobUrl: string,
        pageNumber: number,
        year: string,
        documentType: string
    ) => {
        setSelectedTables(prevTables => {
            const existingIndex = prevTables.findIndex(
                table => table.id === docId && table.tableId === tableId
            );

            if (existingIndex !== -1) {
                // Remove if already selected
                return prevTables.filter((_, index) => index !== existingIndex);
            } else {
                // Add new selection
                const newTable: SelectedTable = {
                    id: docId,
                    blobUrl,
                    pageNumber,
                    tableId,
                    year,
                    documentType,
                    table_without_caption: ""
                };
                return [...prevTables, newTable];
            }
        });

        setSelectedSecondaryTableId(prev => prev === tableId ? null : tableId);
    }, []);

    // Handle document selection
    const handleDocumentSelection = useCallback((docId: number) => {
        const selectedDoc = currentCompanyDocuments.find((doc: any) => doc.id === docId);
        if (!selectedDoc) return;

        const docSelection: SelectedDocument = {
            id: docId,
            url: selectedDoc.url,
            year: selectedDoc.year,
            documentType: selectedDoc.documentType
        };

        setSelectedDocumentsList([docSelection]);
        setActiveTab(`doc-${docId}`);
    }, [currentCompanyDocuments]);

    // Handle tab change
    const handleTabChange = useCallback((value: string) => {
        setActiveTab(value);
    }, []);

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
        setShowSimilarTables(false);
    }, [dispatch]);

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
                <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
                    <p className="text-gray-600 mb-4">No company documents found.</p>
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Close
                    </button>
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
                            {isLoading && (
                                <div className="ml-2 text-sm text-blue-600">Loading...</div>
                            )}
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
                    <main className="flex-1 overflow-hidden h-full rounded-b-lg">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex items-center justify-start w-full h-full bg-white">

                            <TabsList className="w-[20%] p-2 h-full bg-[#FAFCFF] border-r border-[#eaf0fc] rounded-none flex flex-col items-center justify-start gap-2.5">
                                <TabsTrigger
                                    value="primary-table"
                                    className="w-full border !border-[#004CE6] text-[#001742] bg-white hover:bg-white p-2 flex items-center justify-between shadow-custom-blue"
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
                                        className="w-full border !border-[#eaf0fc] bg-white hover:bg-white hover:!border-[#DEE6F5] p-2 flex items-center justify-between hover:shadow-custom-blue disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => handleDocumentSelection(doc.id)}
                                    >
                                        <div className="flex flex-col items-start text-left">
                                                {doc.name.replace(/[^a-zA-Z0-9\s]/g, " ").toUpperCase()}
                                        </div>
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 text-[#004CE6] animate-spin" />
                                        ) : (
                                            <Checkbox
                                                className="border-border-primary data-[state=checked]:!border-[#004CE6] data-[state=checked]:!bg-[#004CE6] data-[state=checked]:!text-white data-[state=checked]:!opacity-100"
                                                checked={selectedDocumentsList.some((selectedDoc) => selectedDoc.id === doc.id)}
                                            />
                                        )}
                                    </TabsTrigger>
                                ))}

                                <TabsTrigger
                                    value="combined-table"
                                    className="w-full border !border-[#eaf0fc] text-[#001742] bg-white hover:bg-white p-2 flex items-center justify-center gap-2"
                                    disabled={!hasSelectedTables}
                                >
                                    <Image src={Excelcon} alt="Excel Icon" width={24} height={24} />
                                    Combine selected tables
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="primary-table" className="w-[75%] h-full bg-white m-0 px-4 py-3 overflow-y-auto scrollbar-hide">
                                <PrimaryTable
                                    primaryTableData={primaryTableData}
                                    primaryTableImage={primaryTableData?.table_without_caption || ""}
                                />
                            </TabsContent>

                            {filteredCompanyDocuments.map((doc: any) => {
                                const { bestMatch, otherMatches } = getTablesForYear(doc.year);
                                
                                return (
                                    <TabsContent 
                                        key={doc.id}
                                        value={`doc-${doc.id}`} 
                                        className="w-[80%] h-full bg-white m-0 overflow-hidden"
                                    >
                                        <SecondaryTable 
                                            bestMatchTable={bestMatch || {}}
                                            otherMatches={otherMatches || []}
                                            onTabChange={(value) => {
                                                if (value === 'best-match' && bestMatch) {
                                                    setSelectedSecondaryTableId(bestMatch.table_id);
                                                } else if (value.startsWith('other-match-')) {
                                                    const tableId = value.replace('other-match-', '');
                                                    setSelectedSecondaryTableId(tableId);
                                                }
                                            }}
                                        />
                                    </TabsContent>
                                );
                            })}

                            <TabsContent value="combined-table" className="w-[75%] h-full bg-white m-0 overflow-y-auto scrollbar-hide">
                                <CombinedTable />
                            </TabsContent>

                        </Tabs>
                    </main>

                </div>
            </div>
        </div>
    );
}