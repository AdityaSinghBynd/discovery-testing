import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import Image from "next/image";
import PDF from "../../../../public/images/PDFIcon2.svg";
import WORD from "../../../../public/images/Word.svg";
import { pdf } from '@react-pdf/renderer';
import { PDFViewer } from '@react-pdf/renderer';
import { PDFDocument } from './PDFDocument';
import { getSession } from "next-auth/react";
import { BASE_URL } from "@/constant/constant";
import { useRouter } from "next/router";
import convertToWord from './WordDocument';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentTitle: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
    isOpen,
    onClose,
    documentTitle,
}) => {
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [blocks, setBlocks] = useState<any[]>([]);
    const router = useRouter();
    const { slug } = router.query;

    // Reset states when modal closes
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setLoading(true);
                setPdfBlob(null);
                setBlocks([]);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Fetch latest content when modal opens
    useEffect(() => {
        const fetchLatestContent = async () => {
            if (!isOpen || !slug) return;

            try {
                setLoading(true);
                const session = await getSession();
                if (!session?.accessToken) throw new Error("No access token found");

                const response = await fetch(`${BASE_URL}/editor-blocks/${slug}`, {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch content");

                const data = await response.json();
                if (!data?.data?.blocks) throw new Error("Invalid data format");

                setBlocks(data.data.blocks);
                generatePDF(data.data.blocks);
            } catch (error) {
                console.error("Error fetching content:", error);
                setLoading(false);
            }
        };

        fetchLatestContent();
    }, [isOpen, slug]);

    const generatePDF = async (contentBlocks: any[]) => {
        try {
            const blob = await pdf(<PDFDocument blocks={contentBlocks} title={documentTitle} />).toBlob();
            setPdfBlob(blob);
            setTimeout(() => {
                setLoading(false);
            }, 200);
        } catch (error) {
            console.error('Error generating PDF:', error);
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        if (!pdfBlob) return;

        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${documentTitle}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportWord = async () => {
        if (loading || blocks.length === 0) return;

        try {
            await convertToWord(blocks, documentTitle);
        } catch (error) {
            console.error("Error exporting to Word:", error);
        }
    };

    const SkeletonOverlay = () => (
        <div className="absolute inset-0 bg-white z-10 p-3">
            <div className="flex flex-col space-y-2">
                <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/5 mb-1" />
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                </div>
                <div className="animate-pulse">
                    <div className="h-40 bg-gray-200 rounded w-full mb-2" />
                </div>
                <div className="animate-pulse space-y-2 mt-3">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-4/5" />
                    <div className="h-3 bg-gray-200 rounded w-3/5" />
                </div>
                <div className="animate-pulse">
                    <div className="h-40 bg-gray-200 rounded w-full mt-2" />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogOverlay className="bg-[#F3F6FF]/20 backdrop-blur-sm" />
            <DialogContent className="max-w-7xl rounded p-0 bg-[#f5f7fa] gap-0 h-[80vh] flex flex-col">
                <DialogTitle className="sr-only">
                    Export Document
                </DialogTitle>
                <DialogHeader className="flex flex-row items-center rounded justify-between h-[40px] w-full bg-white border-b-2 border-[#EAF0FC] py-2.5 px-3">
                    <h2 className="text-lg font-medium text-[#001742]">Export Document</h2>
                    <button
                        className="h-5 w-5 hover:cursor-pointer m-0"
                        onClick={onClose}
                    >
                        <X className="h-5 w-5 text-[#001742]" />
                    </button>
                </DialogHeader>

                {/* Main Content Area */}
                <div className="flex gap-3 p-3 flex-grow">
                    {/* Left Section - PDF Preview */}
                    <div className="relative w-3/5 bg-white shadow-custom-blue rounded overflow-hidden">
                        <div className="h-full w-full">
                            <PDFViewer
                                width="100%"
                                height="100%"
                                showToolbar={false}
                                className="rounded"
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                }}
                            >
                                <PDFDocument blocks={blocks} title={documentTitle} />
                            </PDFViewer>

                            {loading && <SkeletonOverlay />}
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="w-2/5">
                        <div className="flex flex-col gap-1 mb-3">
                            <h3 className="text-[18px] font-medium text-gray-800">Export Options</h3>
                            <p className="text-sm text-gray-500">Select the format you want to export the document to.</p>
                        </div>

                        <div className="flex flex-col gap-3 w-[300px]">
                            <button
                                onClick={handleExportPDF}
                                disabled={loading || !pdfBlob || blocks.length === 0}
                                className={`flex text-sm flex-row gap-2 rounded bg-white border-1 border-[#EAF0FC] p-3 ${loading || !pdfBlob || blocks.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-custom-blue'
                                    }`}
                            >
                                <Image src={PDF} alt="PDF" width={20} height={20} />
                                Export as PDF
                            </button>

                            <button
                                onClick={handleExportWord}
                                disabled={loading || blocks.length === 0}
                                className={`flex text-sm flex-row gap-2 rounded bg-white border-1 border-[#EAF0FC] p-3 ${loading || blocks.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-custom-blue'
                                    }`}
                            >
                                <Image src={WORD} alt="Word" width={20} height={20} />
                                Export as Word
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ExportModal;