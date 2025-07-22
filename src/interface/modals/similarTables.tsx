interface SimilarTablesModalProps {
    isOpen: boolean;
    selectedDocs: string[];
    similarTables: any;
    onClose: () => void;
}

export type { SimilarTablesModalProps };