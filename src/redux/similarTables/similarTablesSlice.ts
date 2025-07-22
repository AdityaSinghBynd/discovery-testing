import { SIMILAR_TABLES_API_URL } from '@/constant/constant';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getSession } from 'next-auth/react';
import { baseUrl } from '@/utils/utils';
import { 
    FetchSimilarTablesPayload, 
    SimilarTablesResponse,
    SimilarTablesAPIState
} from '@/redux/modals/similarTables/similiartable.interface';

interface SimilarTablesState {
    similarTables: Record<string, SimilarTablesAPIState>;
}

const initialState: SimilarTablesState = {
    similarTables: {},
};

export const fetchSimilarTables = createAsyncThunk<
    {
        tableId: string;
        pageNumber: number;
        data: { [tableId: string]: SimilarTablesResponse };
    },
    FetchSimilarTablesPayload
>(
    'similarTables/fetchSimilarTables',
    async ({ sourceUrl, tableId, pageNumber, compatiorUrls}, { rejectWithValue }) => {
        try {
            const session = await getSession();
            const url = baseUrl(sourceUrl) + '/Processed/SimilarTables/' + tableId + '.json';
            const fetchblob = await fetch(url)
            if(fetchblob.ok) {
                const data = await fetchblob.json();
                return {
                    tableId,
                    pageNumber,
                    data: {
                        [tableId]: data
                    }
                };
            }
            const response = await axios.post(`${SIMILAR_TABLES_API_URL}`, {
                table_id: tableId,
                competitor_pdf_urls: compatiorUrls,
                source_pdf: sourceUrl,
                page_number: pageNumber
            }, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            });
            return {
                tableId,
                pageNumber,
                data: response?.data?.result
            };
        } catch (error) {
            console.error('Error fetching similar tables:', error);
            return rejectWithValue({
                message: error instanceof Error ? error.message : 'Failed to fetch similar tables'
            });
        }
    }
);

const similarTablesSlice = createSlice({
    name: 'similarTables',
    initialState,
    reducers: {
        setSimilarTables: (state: SimilarTablesState, action: PayloadAction<Record<string, SimilarTablesAPIState>>) => {
            state.similarTables = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSimilarTables.pending, (state, action) => {
                const { tableId } = action.meta.arg;
                if (!state.similarTables[tableId]) {
                    state.similarTables[tableId] = {
                        data: null,
                        loading: true,
                        error: null
                    };
                } else {
                    state.similarTables[tableId].loading = true;
                    state.similarTables[tableId].error = null;
                }
            })
            .addCase(fetchSimilarTables.fulfilled, (state, action) => {
                const { tableId, data } = action.payload;
                state.similarTables[tableId] = {
                    data: data[tableId],
                    loading: false,
                    error: null
                };
            })
            .addCase(fetchSimilarTables.rejected, (state, action) => {
                const { tableId } = action.meta.arg;
                state.similarTables[tableId] = {
                    data: null,
                    loading: false,
                    error: 'Failed to fetch similar tables'
                };
            });
    }
});

export const { setSimilarTables } = similarTablesSlice.actions;
export default similarTablesSlice.reducer;