import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchSimilarTables, fetchPreviewData } from './similarTablesThunks';
import { SimilarTablesResponse } from './similiartable.interface';

interface SimilarTablesData {
    data: SimilarTablesResponse | null;
    loading: boolean;
    error: string | null;
}

interface PreviewDataItem {
    data: any;
    loading: boolean;
    error: string | null;
}

interface PreviewData {
    [tableId: string]: {
        [documentType: string]: {
            [year: string]: {
                [tableId: string]: PreviewDataItem;
            };
        };
    };
}

interface SimilarTablesState {
    // UI State
    isSimilarTablesOpen: boolean;
    primaryTableImage: string;
    selectedDocs: string[];
    tableId: string;
    currentPage: number;

    // Data State
    similarTables: Record<string, SimilarTablesData>;
    previewData: PreviewData;

    // Global Status
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: SimilarTablesState = {
    // UI State
    isSimilarTablesOpen: false,
    primaryTableImage: '',
    selectedDocs: [],
    tableId: '',
    currentPage: 0,

    // Data State
    similarTables: {},
    previewData: {},

    // Global Status
    status: 'idle',
    error: null,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const createSimilarTablesData = (overrides: Partial<SimilarTablesData> = {}): SimilarTablesData => ({
    data: null,
    loading: false,
    error: null,
    ...overrides,
});

const createPreviewDataItem = (overrides: Partial<PreviewDataItem> = {}): PreviewDataItem => ({
    data: null,
    loading: false,
    error: null,
    ...overrides,
});

// ============================================================================
// SLICE DEFINITION
// ============================================================================

const similarTablesSlice = createSlice({
    name: 'similarTables',
    initialState,
    reducers: {
        // UI Actions
        setIsSimilarTablesOpen: (state, action: PayloadAction<boolean>) => {
            state.isSimilarTablesOpen = action.payload;
        },

        setPrimaryTableImage: (state, action: PayloadAction<string>) => {
            state.primaryTableImage = action.payload;
        },

        setSelectedDocs: (state, action: PayloadAction<string[]>) => {
            state.selectedDocs = action.payload;
        },

        setTableId: (state, action: PayloadAction<string>) => {
            state.tableId = action.payload;
        },

        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },

        // Data Actions
        setSimilarTables: (state, action: PayloadAction<Record<string, SimilarTablesData>>) => {
            state.similarTables = action.payload;
        },

        setPreviewData: (state, action: PayloadAction<PreviewData>) => {
            state.previewData = action.payload;
        },

        // Utility Actions
        clearError: (state) => {
            state.error = null;
            state.status = 'idle';
        },

        resetSimilarTablesState: (state) => {
            Object.assign(state, initialState);
        },
    },

    extraReducers: (builder) => {
        builder
        
            // ========================================================================
            // FETCH SIMILAR TABLES
            // ========================================================================

            .addCase(fetchSimilarTables.pending, (state, action) => {
                const { tableId } = action.meta.arg;

                state.status = 'loading';
                state.error = null;

                // Initialize or update table state
                state.similarTables[tableId] = createSimilarTablesData({
                    ...state.similarTables[tableId],
                    loading: true,
                    error: null,
                });
            })

            .addCase(fetchSimilarTables.fulfilled, (state, action) => {
                const { tableId, data } = action.payload;

                state.status = 'succeeded';
                state.error = null;

                state.similarTables[tableId] = createSimilarTablesData({
                    data,
                    loading: false,
                    error: null,
                });
            })

            .addCase(fetchSimilarTables.rejected, (state, action) => {
                const { tableId } = action.meta.arg;
                const errorMessage = action.error.message || 'Failed to fetch similar tables';

                state.status = 'failed';
                state.error = errorMessage;

                state.similarTables[tableId] = createSimilarTablesData({
                    data: null,
                    loading: false,
                    error: errorMessage,
                });
            })

            // ========================================================================
            // FETCH PREVIEW DATA
            // ========================================================================

            .addCase(fetchPreviewData.pending, (state, action) => {
                const { tables } = action.meta.arg;
                
                // Use the first table's ID as the key for preview data
                if (tables.length > 0) {
                    const firstTable = tables[0];
                    const tableId = firstTable.table_id;
                    const documentType = firstTable.document_type;
                    const year = firstTable.year.toString();

                    // Initialize nested structure if it doesn't exist
                    if (!state.previewData[tableId]) {
                        state.previewData[tableId] = {};
                    }
                    if (!state.previewData[tableId][documentType]) {
                        state.previewData[tableId][documentType] = {};
                    }
                    if (!state.previewData[tableId][documentType][year]) {
                        state.previewData[tableId][documentType][year] = {};
                    }

                    state.previewData[tableId][documentType][year][tableId] = createPreviewDataItem({
                        loading: true,
                        error: null,
                    });
                }
            })

            .addCase(fetchPreviewData.fulfilled, (state, action) => {
                const { tables } = action.meta.arg;
                
                // Use the first table's ID as the key for preview data
                if (tables.length > 0) {
                    const firstTable = tables[0];
                    const tableId = firstTable.table_id;
                    const documentType = firstTable.document_type;
                    const year = firstTable.year.toString();

                    // Ensure nested structure exists
                    if (!state.previewData[tableId]?.[documentType]?.[year]) {
                        return; // Guard against race conditions
                    }

                    state.previewData[tableId][documentType][year][tableId] = createPreviewDataItem({
                        data: action.payload,
                        loading: false,
                        error: null,
                    });
                }
            })

            .addCase(fetchPreviewData.rejected, (state, action) => {
                const { tables } = action.meta.arg;
                const errorMessage = action.error.message || 'Failed to fetch preview data';
                
                // Use the first table's ID as the key for preview data
                if (tables.length > 0) {
                    const firstTable = tables[0];
                    const tableId = firstTable.table_id;
                    const documentType = firstTable.document_type;
                    const year = firstTable.year.toString();

                    // Ensure nested structure exists
                    if (!state.previewData[tableId]?.[documentType]?.[year]) {
                        return; // Guard against race conditions
                    }

                    state.previewData[tableId][documentType][year][tableId] = createPreviewDataItem({
                        data: null,
                        loading: false,
                        error: errorMessage,
                    });
                }
            })

    },
});

// ============================================================================
// EXPORTS
// ============================================================================

// Action creators
export const {
    setIsSimilarTablesOpen,
    setPrimaryTableImage,
    setSelectedDocs,
    setTableId,
    setCurrentPage,
    setSimilarTables,
    setPreviewData,
    clearError,
    resetSimilarTablesState,
} = similarTablesSlice.actions;

// Thunks (re-exported for convenience)
export {
    fetchSimilarTables,
    fetchPreviewData,
} from './similarTablesThunks';

// Reducer
export default similarTablesSlice.reducer;

// ============================================================================
// SELECTORS (Optional - for better performance and reusability)
// ============================================================================

export const selectSimilarTablesState = (state: { similarTables: SimilarTablesState }) => state.similarTables;

export const selectSimilarTableById = (state: { similarTables: SimilarTablesState }, tableId: string) =>
    state.similarTables.similarTables[tableId];

export const selectIsLoading = (state: { similarTables: SimilarTablesState }) =>
    state.similarTables.status === 'loading';

export const selectHasError = (state: { similarTables: SimilarTablesState }) =>
    state.similarTables.status === 'failed' || Boolean(state.similarTables.error);