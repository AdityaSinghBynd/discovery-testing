import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import styles from "@/styles/editorHeader.module.scss";
import SimplePDFIcon from "../../../../public/images/simplePDFIcon.svg";
import ExportModal from "@/components/Modals/Export";
import { truncateText } from "@/utils/utils";
import { Share } from "lucide-react";

interface EditorHeaderProps {
    documentTitle: string;
    onTitleChange: (title: string) => void;
    blocks: any;
    setBlocks: (blocks: any) => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
    documentTitle,
    onTitleChange,
    blocks,
    setBlocks,
}) => {
    const [showExportModal, setShowExportModal] = useState(false);
    const router = useRouter();
    const { slug } = router.query;
    const hasLoadedFromStorage = useRef(false);

    // Load saved title from localStorage only on initial mount
    useEffect(() => {
        if (slug && !hasLoadedFromStorage.current) {
            const savedTitle = localStorage.getItem(`document_title_${slug}`);
            if (savedTitle && savedTitle !== documentTitle) {
                onTitleChange(savedTitle);
            }
            hasLoadedFromStorage.current = true;
        }
    }, [slug, onTitleChange]);

    return (
        <div className={styles.editorHeader}>
            {/* Editor File Name */}
            <div className={styles.tab}>
                <label>
                    <Image src={SimplePDFIcon} alt="PDFIcon" width={20} height={20} />
                </label>
                <p className={styles.truncatedTitle}>
                    {documentTitle.length > 21
                        ? truncateText(documentTitle, 20)
                        : documentTitle}
                </p>
            </div>

            {/* Export Button */}
            <button onClick={() => setShowExportModal(true)} className="flex flex-row gap-2 text-sm items-center bg-white border-1 border-[#fff] hover:bg-[#F3F6FF] hover:border-[#eaf0fc] hover:shadow-custom-blue rounded py-2 px-2.5">
                Export Document
                <Share className="w-4 h-4" />
            </button>

            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                documentTitle={documentTitle}
            />
        </div>
    );
};

export default EditorHeader;