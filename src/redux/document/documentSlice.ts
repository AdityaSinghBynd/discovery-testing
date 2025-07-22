import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchSections } from "./documentThunks";

interface DocumentState {
  globalPdfUrl: string;
  status: string;
  error: any;
  documents: any[];
  graphData: any;
  textData: Record<string, any>;
  id: number;
  tableData: { [documentId: string]: any };
  documentLists: Record<string, any[]>;
  currentDocuments: any[];
  aiSummary: Record<string, any>;
  sections: any;
}

const initialState: DocumentState = {
  globalPdfUrl: "",
  id: 0,
  graphData: {},
  tableData: {},
  textData: { data: {} },
  documentLists: {},
  status: "",
  documents: [],
  currentDocuments: [],
  error: "",
  aiSummary: {},
  sections: {},
};

const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    setDocuments(state, action) {
      state.documents = action.payload;
    },
    setCompanyDocuments: (state, action) => {
      const { companyName, documents } = action.payload;
      state.documentLists[companyName] = documents;
    },
    setCurrentDocuments(state, action) {
      state.currentDocuments = action.payload;
    },
    setPollingStatus(state, action) {
      const documentIndex = state.documents.findIndex(
        (doc: any) => doc.id === action.payload.id,
      );

      if (documentIndex !== -1) {
        state.documents[documentIndex].status = "completed";
      } else {
        console.warn(`Document with ID ${action.payload.id} not found.`);
      }
    },
    setTextData(state, action) {
      const pageNumber = String(action.payload.currentPage);
      const index = Number(action.payload.key);

      if (!state.textData.data[pageNumber]) {
        state.textData.data[pageNumber] = {};
      }

      state.textData.data[pageNumber][index] = {
        ...state.textData.data[pageNumber][index],
        aiSummary: action.payload.aiSummary,
      };
    },
    setGlobalPdfUrl: (state, action: PayloadAction<string>) => {
      state.globalPdfUrl = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Table Data
    builder

      .addCase(fetchSections.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.sections[action.payload.id] = action.payload.data;
      })
      .addCase(fetchSections.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchSections.pending, (state, action) => {
        const actionMeta = action.meta as any;
        if (!actionMeta?.isSearchRequest) {
          state.status = "loading";
        }
      });
  },
});

export const {
  setGlobalPdfUrl,
  setDocuments,
  setTextData,
  setPollingStatus,
  setCompanyDocuments,
  setCurrentDocuments,
} = documentSlice.actions;

export default documentSlice.reducer;
