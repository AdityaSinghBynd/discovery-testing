import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addElement, fetchElementsByWorkspaceId } from "./elementThunks";

interface ElementState {
  status: string;
  error: string | null;
  elementsByWorkspaceId: Record<string, any>;
  hasNextPage: boolean;
  currentPage: number;
  loading: boolean;
  selectedTableIds: [];
  elementDetails: Record<
    string,
    { pageNumber: number; contentTitle: string; html: string }
  >;
}

const initialState: ElementState = {
  status: "",
  elementsByWorkspaceId: {},
  error: null,
  hasNextPage: true,
  currentPage: 1,
  loading: false,
  selectedTableIds: [],
  elementDetails: {} as Record<
    string,
    { pageNumber: number; contentTitle: string; html: string }
  >,
};

const elementsSlice = createSlice({
  name: "element",
  initialState,
  reducers: {
    setSelectedTableIds: (state, action) => {
      state.selectedTableIds = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    resetPagination: (state) => {
      state.currentPage = 1;
      state.hasNextPage = true;
      state.elementsByWorkspaceId = {};
    },
    updateElementDetails(
      state,
      action: PayloadAction<{
        id: string;
        pageNumber: number;
        contentTitle: string;
        html: string;
      }>,
    ) {
      const { id, pageNumber, contentTitle, html } = action.payload;
      state.elementDetails[id] = { pageNumber, contentTitle, html };
    },
    removeElementDetails(state, action: PayloadAction<string>) {
      delete state.elementDetails[action.payload];
    },
    resetElementDetails: (state) => {
      state.elementDetails = {};
      state.selectedTableIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchElementsByWorkspaceId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchElementsByWorkspaceId.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";

        // Update hasNextPage from API response
        state.hasNextPage = action.payload.hasNextPage;

        // Handle first page vs subsequent pages
        if (state.currentPage === 1) {
          state.elementsByWorkspaceId[action.payload.workspaceId] =
            action.payload.elements;
        } else {
          // Append new elements for subsequent pages
          if (!state.elementsByWorkspaceId[action.payload.workspaceId]) {
            state.elementsByWorkspaceId[action.payload.workspaceId] = [];
          }
          state.elementsByWorkspaceId[action.payload.workspaceId] = [
            ...state.elementsByWorkspaceId[action.payload.workspaceId],
            ...action.payload.elements,
          ];
        }
      })
      .addCase(fetchElementsByWorkspaceId.rejected, (state, action: any) => {
        state.error = action.payload;
        state.status = "failed";
        state.error = action.payload;
        state.hasNextPage = false;
      })

      .addCase(addElement.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addElement.fulfilled, (state, action: any) => {
        state.status = "succeeded";

        if (!state.elementsByWorkspaceId[action.payload.workspace.id]) {
          state.elementsByWorkspaceId[action.payload.workspace.id] = [];
        }

        state.elementsByWorkspaceId[action.payload.workspace.id].push(
          action.payload,
        );
      })
      .addCase(addElement.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});
export const {
  setCurrentPage,
  resetPagination,
  setSelectedTableIds,
  updateElementDetails,
  removeElementDetails,
  resetElementDetails,
} = elementsSlice.actions;
export default elementsSlice.reducer;
