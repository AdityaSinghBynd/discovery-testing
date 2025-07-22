import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SimilarTablesModalProps } from '@/interface/modals/similarTables';
import { fetchPreviewData, fetchSimilarTables } from './similarTablesThunks';

interface SimilarTablesData {
    data: any;
    loading: boolean;
    error?: string;
}

interface SimilarTablesState {
    isSimilarTablesOpen: boolean;
    primaryTableImage: string;
    selectedDocs: string[];
    similarTables: Record<string, SimilarTablesData>;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    tableId: string;
    currentPage: number;
    previewData: Record<string, any>;
}

const initialState: SimilarTablesState = {
    isSimilarTablesOpen: false,
    tableId: "",
    primaryTableImage: "",
    selectedDocs: [],
    similarTables: {},
    status: 'idle',
    error: null,
    currentPage: 0,
    previewData: {}
};

// Helper function to update similar tables state
const updateSimilarTablesData = (
    state: SimilarTablesState,
    id: string,
    data: Partial<SimilarTablesData>
) => {
    state.similarTables = {
        ...state.similarTables,
        [id]: {
            ...state.similarTables[id],
            ...data,
        },
    };
};

const similarTablesSlice = createSlice({
    name: 'similarTables',
    initialState,
    reducers: {
        setSelectedDocs: (state, action: PayloadAction<string[]>) => {
            state.selectedDocs = action.payload;
        },
        setIsSimilarTablesOpen: (state, action: PayloadAction<boolean>) => {
            state.isSimilarTablesOpen = action.payload;
        },
        setPrimaryTableImage: (state, action: PayloadAction<string>) => {
            state.primaryTableImage = action.payload;
        },
        setTableId: (state, action: PayloadAction<string>) => {
            state.tableId = action.payload;
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setPreviewData: (state, action: PayloadAction<any>) => {
            state.previewData = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSimilarTables.pending, (state, action: any) => {
                const id = action.meta.arg.id;
                state.status = 'loading';
                updateSimilarTablesData(state, id, {
                    data: null,
                    loading: true,
                    error: undefined
                });
            })
            .addCase(fetchSimilarTables.fulfilled, (state, action) => {
                const { id, data } = action.payload;
                state.status = 'succeeded';
                updateSimilarTablesData(state, id, {
                    data: data,
                    loading: false,
                    error: undefined
                });
            })
            .addCase(fetchSimilarTables.rejected, (state, action: any) => {
                const id = action.meta.arg.id;
                const errorMessage = action.error.message || "Error fetching similar tables";
                state.status = 'failed';
                state.error = errorMessage;
                updateSimilarTablesData(state, id, {
                    data: null,
                    loading: false,
                    error: errorMessage
                });
            })
            .addCase(fetchPreviewData.fulfilled, (state, action) => {
                state.previewData = {
                    ...state.previewData,
                    [action.meta.arg.tableId]: {
                        ...state.previewData[action.meta.arg.tableId],
                        [action.meta.arg.data[1].documentType]: {
                            ...state.previewData[action.meta.arg.tableId][action.meta.arg.data[1].documentType],
                            [action.meta.arg.data[1].year]: {
                                [action.meta.arg.tableId]: {
                                    data: action.payload.data,
                                    loading: false,
                                    error: null
                                }
                            }
                        }
                    },
                }
            })
            .addCase(fetchPreviewData.rejected, (state, action) => {
                state.previewData = {
                    ...state.previewData,
                    [action.meta.arg.tableId]: {
                        ...state.previewData[action.meta.arg.tableId],
                        [action.meta.arg.data[1].documentType]: {
                            ...state.previewData[action.meta.arg.tableId][action.meta.arg.data[1].documentType],
                            [action.meta.arg.data[1].year]: {
                                [action.meta.arg.tableId]: {
                                    data: null,
                                    loading: false,
                                    error: "Error fetching preview data"
                                }
                            }
                        }
                    }
                };
            })
            .addCase(fetchPreviewData.pending, (state, action) => {
                state.previewData = {
                    ...state.previewData,
                    [action.meta.arg.tableId]: {
                        ...state.previewData[action.meta.arg.tableId],
                        [action.meta.arg.data[1].documentType]: {
                            ...state.previewData[action.meta.arg.tableId][action.meta.arg.data[1].documentType],
                            [action.meta.arg.tableId]: {
                                data: null,
                                loading: true,
                                error: null
                            }
                        }
                    }
                };
            })
    },
});

export const { setSelectedDocs, setIsSimilarTablesOpen, setTableId, setCurrentPage, setPreviewData } = similarTablesSlice.actions;
export default similarTablesSlice.reducer;