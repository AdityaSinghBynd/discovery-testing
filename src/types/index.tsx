interface SimilarTables {
    [tableId: string]: {
        [companyName: string]: {
            [documentType: string]: {
                [year: string]: SimilarTablesData;
            };
        };
    };
}

interface SimilarTablesData {
    data: any;
    loading: boolean;
    error: string | null;
}