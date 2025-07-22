import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getSession } from 'next-auth/react';
import { 
    CombinedTablesPayload, 
    CombinedTablesResponse,
    APIResponse
} from '@/redux/modals/similarTables/similiartable.interface';

interface CombinedTablesState {
    combinedTables: APIResponse<CombinedTablesResponse>;
}

const initialState: CombinedTablesState = {
    combinedTables: {
        data: null,
        loading: false,
        error: null
    }
};

export const fetchCombinedTables = createAsyncThunk<
    CombinedTablesResponse,
    CombinedTablesPayload
>(
    'combinedTables/fetchCombinedTables',
    async (payload, { rejectWithValue }) => {
        try {
            const session = await getSession();
            // Replace with actual API endpoint
            const API_URL = process.env.NEXT_PUBLIC_COMBINED_TABLES_API_URL || '/api/combined-tables';
            
            const response = await axios.post(API_URL, payload, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            
            return response.data;
        } catch (error) {
            console.error('Error fetching combined tables:', error);
            return rejectWithValue({
                message: error instanceof Error ? error.message : 'Failed to fetch combined tables'
            });
        }
    }
);

const combinedTablesSlice = createSlice({
    name: 'combinedTables',
    initialState,
    reducers: {
        resetCombinedTables: (state) => {
            state.combinedTables = {
                data: null,
                loading: false,
                error: null
            };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCombinedTables.pending, (state) => {
                state.combinedTables.loading = true;
                state.combinedTables.error = null;
            })
            .addCase(fetchCombinedTables.fulfilled, (state, action) => {
                state.combinedTables = {
                    data: action.payload,
                    loading: false,
                    error: null
                };
            })
            .addCase(fetchCombinedTables.rejected, (state, action) => {
                state.combinedTables = {
                    data: null,
                    loading: false,
                    error: action.payload as string || 'Failed to fetch combined tables'
                };
            });
    }
});

export const { resetCombinedTables } = combinedTablesSlice.actions;
export default combinedTablesSlice.reducer; 