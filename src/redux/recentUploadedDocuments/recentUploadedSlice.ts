import {
  fetchRecentUploadedDocuments,
  uploadDocument,
  deleteRecentUploadedDocuments,
} from "./recentUploadedThunks";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RecentUploadedState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  recentUploadedDocuments: any[];
}

const initialState: RecentUploadedState = {
  status: "idle",
  error: null,
  recentUploadedDocuments: [],
};

const recentUploadedSlice = createSlice({
  name: "recentUploaded",
  initialState,
  reducers: {
    addDocument: (state, action: PayloadAction<any>) => {
      state.status = "succeeded";
      state.recentUploadedDocuments.push(action.payload);
    },
    addRecentUpload: (state, action: PayloadAction<any>) => {
      state.recentUploadedDocuments.unshift(action.payload);
    },
    removeRecentUpload: (state, action: PayloadAction<string>) => {
      state.recentUploadedDocuments = state.recentUploadedDocuments.filter(
        doc => doc.id !== action.payload
      );
    },
    updateStatus: (state, action: PayloadAction<{ fileId: string; status: any }>) => {
      state.recentUploadedDocuments = state.recentUploadedDocuments.map(
        (doc) =>
          doc.id === action.payload.fileId
            ? { ...doc, status: action.payload.status }
            : doc,
      );
    },
    updateUploadStatus: (state, action: PayloadAction<{ id: string; status: any }>) => {
      const upload = state.recentUploadedDocuments.find(doc => doc.id === action.payload.id);
      if (upload) {
        upload.status = action.payload.status;
      }
    },
    resetRecentUploaded: () => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.recentUploadedDocuments = [
          ...state.recentUploadedDocuments,
          action.payload,
        ];
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to upload document";
      })
      .addCase(uploadDocument.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRecentUploadedDocuments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.recentUploadedDocuments = action.payload;
      })
      .addCase(fetchRecentUploadedDocuments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch documents";
      })
      .addCase(fetchRecentUploadedDocuments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteRecentUploadedDocuments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.recentUploadedDocuments = state.recentUploadedDocuments.filter(doc => doc.id !== action.payload);
      })
      .addCase(deleteRecentUploadedDocuments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to delete document";
      })
      .addCase(deleteRecentUploadedDocuments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      });
  },
});

export const {
  addDocument,
  addRecentUpload,
  removeRecentUpload,
  updateStatus,
  updateUploadStatus,
  resetRecentUploaded,
} = recentUploadedSlice.actions;

export default recentUploadedSlice.reducer;
