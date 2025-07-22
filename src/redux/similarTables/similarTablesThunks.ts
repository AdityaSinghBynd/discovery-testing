import axios from 'axios';
import { SIMILAR_TABLES_API_URL } from '@/constant/constant';
import { RootState } from '@/store/store';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchSimilarTables = createAsyncThunk('similarTables/fetchSimilarTables', async (tableId: string, { getState }) => {
    const state = getState() as RootState;
    const { selectedDocs } = state.similarTables;
    const response = await axios.post(`${SIMILAR_TABLES_API_URL}/similar_tables`, {
        table_id: tableId,
        selected_docs: selectedDocs
    });
    return response.data;
});