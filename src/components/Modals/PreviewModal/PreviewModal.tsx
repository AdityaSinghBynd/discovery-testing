import HTMLToShadcnTable from "@/components/Html/Table";
import { useExcelDownload } from "@/hooks/Toolbar/useExcelDownload";
import { RootState } from "@/store/store";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { getSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import multiTableIcon from '../../../../public/images/Frame 1000004460.svg';
import Image from "next/image";

interface PreviewModalProps {
    open: boolean;
    onClose: () => void;
    selectedTables: Array<{
        id: number;
        blobUrl: string;
        pageNumber: number;
        tableId: string | number;
        year: string;
        documentType: string;
    }>;
}

const PreviewModal = ({ open, onClose, selectedTables }: PreviewModalProps) => {
    const dispatch = useDispatch();
    const [previewData, setPreviewData] = useState<{ [key: string]: any }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const tableId = useSelector((state: RootState) => state.similarTables.tableId);
    const { downloadExcel } = useExcelDownload();

    const handleExport = () => {
        if (!previewData?.html) {
            console.error('No preview data available for export');
            return;
        }
        try {
            downloadExcel(previewData.html, "combined_tables");
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!tableId || !selectedTables?.length) return;

            setIsLoading(true);
            setError(null);

            try {
                const session = await getSession();
                const previewResponse = await axios.post(`${process.env.NEXT_PUBLIC_PREVIEW_DATA_API_URL}`, {
                    "tables": selectedTables
                        .filter(table => table.pageNumber !== 0)
                        .map(table => ({
                            ...table,
                            blob_url: table.blobUrl || "",
                            page_number: table.pageNumber,
                            table_id: table.tableId,
                            year: table.year,
                            document_type: table.documentType
                        }))
                }, {
                    headers: {
                        'Authorization': `Bearer ${session?.accessToken}`
                    }
                });

                if (previewResponse.status === 200 && previewResponse.data) {
                    setPreviewData(previewResponse.data.merged_table);
                }
            } catch (error) {
                console.error('Error fetching preview data:', error);
                setError("Error fetching preview data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedTables, tableId]);

    if (!open) return null;

    if (error) {
        return (
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-red-500 font-medium">Error loading preview</h3>
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="absolute inset-0 bg-[#0026731A]/30 backdrop-blur-sm"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                    <motion.div
                        className="relative w-[90%] h-[90%] max-w-8xl bg-white rounded-xl shadow-custom-blue flex flex-col"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-3 py-2 border-b border-[#EAF0FC] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                            <Image src={multiTableIcon} alt="best-matched-table" width={26} height={26} />
                                <h2 className="text-[20px] font-medium text-[#001742]">Preview combined tables</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <motion.div
                            className="flex-1 flex min-h-0 overflow-auto p-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center w-full">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                </div>
                            ) : previewData?.html ? (
                                <motion.div
                                    className="w-full"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <HTMLToShadcnTable htmlContent={previewData.html} />
                                </motion.div>
                            ) : (
                                <div className="flex items-center justify-center w-full text-gray-500">
                                    No preview data available
                                </div>
                            )}
                        </motion.div>

                        <motion.footer
                            className="px-3 py-2 border-t border-gray-200 rounded-b-xl flex items-center justify-end bg-white"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                        >
                            <div className="space-x-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-black rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-white border border-gray-200 cursor-not-allowed"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleExport}
                                    disabled={!previewData || isLoading}
                                    className={`px-4 py-2 text-sm font-normal text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${!previewData || isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#017736] hover:bg-[#017736]/90'
                                        }`}
                                >
                                    Export to Excel
                                </button>
                            </div>
                        </motion.footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PreviewModal;