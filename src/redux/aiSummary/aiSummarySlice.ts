import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchAiSummary } from "./aiSummaryThunks";

interface SummaryData {
  id: string;
  data: any;
}

interface SummaryState {
  summary: Record<string, any>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
}

const initialState: SummaryState = {
  summary: {},
  status: "idle",
  error: null,
};

const summarySlice = createSlice({
  name: "summary",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAiSummary.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchAiSummary.fulfilled,
        (state, action: PayloadAction<SummaryData>) => {
          state.status = "succeeded";
          const { id, data } = action.payload;
          state.summary = {
            ...state.summary,
            [id]: data,
          };
        },
      )
      .addCase(fetchAiSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "An unknown error occurred.";
      });
  },
});

export default summarySlice.reducer;
