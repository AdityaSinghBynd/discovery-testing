import { createSlice } from "@reduxjs/toolkit";
import {
  fetchGraphChunks,
  fetchTableChunks,
  fetchTextChunks,
} from "./chunksThunks";

interface ChunksState {
  textChunks: Record<string, any>;
  tableChunks: Record<string, any>;
  graphChunks: Record<string, any>;
  status: string;
  error: string | null;
}
const chunksSlice = createSlice({
  name: "chunks",
  initialState: {
    textChunks: {},
    tableChunks: {},
    graphChunks: {},
    status: "idle",
    error: null,
  } as ChunksState,
  reducers: {
    setTextData(state, action) {
      const { currentPage, key, aiSummary, documentId } = action.payload;

      if (!state.textChunks[documentId][String(currentPage)]) {
        state.textChunks[documentId][String(currentPage)] = {};
      }

      state.textChunks[documentId][String(currentPage)][key] = {
        ...state.textChunks[documentId][String(currentPage)][key],
        aiSummary: aiSummary,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTextChunks.fulfilled, (state: any, action: any) => {
        state.status = "succeeded";
        const { id, data } = action.payload;
        state.textChunks = { ...state.textChunks, [id]: data };
      })
      .addCase(fetchTextChunks.pending, (state: any) => {
        state.status = "loading";
      })
      .addCase(fetchTableChunks.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { id, data } = action.payload;
        state.tableChunks = { ...state.tableChunks, [id]: data };
      })
      .addCase(fetchTableChunks.pending, (state: any) => {
        state.status = "loading";
      })
      .addCase(fetchGraphChunks.fulfilled, (state: any, action: any) => {
        const { id, data } = action.payload;
        state.graphChunks = { ...state.graphChunks, [id]: data };
      })
      .addCase(fetchGraphChunks.pending, (state: any) => {
        state.status = "loading";
      })
      .addCase(fetchTextChunks.rejected, (state: any, action: any) => {
        state.error = action.error.message;
      })
      .addCase(fetchTableChunks.rejected, (state: any, action: any) => {
        state.error = action.error.message;
      })
      .addCase(fetchGraphChunks.rejected, (state: any, action: any) => {
        state.error = action.error.message;
      });
  },
});
export const { setTextData } = chunksSlice.actions;

export default chunksSlice.reducer;
