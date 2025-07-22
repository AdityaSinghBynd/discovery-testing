import { RootState } from "@/store/store";

import { createAsyncThunk } from "@reduxjs/toolkit";
import { PostFile } from "@/services/services";
import { ApiService } from "@/services/service";
import { getSession } from "next-auth/react";

export const uploadDocument = createAsyncThunk<
  any[],
  { payload: FormData; onProgress: (progress: number) => void },
  { state: RootState; rejectValue: string }
>(
  "recentUploadedDocuments/uploadDocument",
  async ({ payload, onProgress }, { rejectWithValue }) => {
    try {
      const response = await PostFile(payload, (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total!,
        );
        onProgress(progress);
      });

      return response;
    } catch (error) {
      console.error("Server Not Responding!", error);
      return rejectWithValue("Failed to upload document");
    }
  },
);

export const fetchRecentUploadedDocuments = createAsyncThunk<
  any[],
  void,
  { state: RootState; rejectValue: string }
>(
  "recentUploadedDocuments/fetchRecentUploadedDocuments",
  async (_, { rejectWithValue }) => {
    try {
      const session = await getSession();
      const response = await ApiService.apiCall(
        "get",
        "/documents/user",
        {},
        session?.accessToken,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch documents");
    }
  },
);

export const deleteRecentUploadedDocuments = createAsyncThunk<
  string,
  { id: string },
  { state: RootState; rejectValue: string }
>(
  "recentUploadedDocuments/deleteRecentUploadedDocuments",
  async ({ id }, { rejectWithValue }) => {
    try {
      const session = await getSession();
      await ApiService.apiCall(
        "delete",
        `/documents/${id}`,
        {},
        session?.accessToken,
      );
      return id;
    } catch (error) {
      return rejectWithValue("Failed to delete document");
    }
  },
);
