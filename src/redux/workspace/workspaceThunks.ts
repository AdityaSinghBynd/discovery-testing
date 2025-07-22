import ApiService from "@/services/service";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSession } from "next-auth/react";

export const deleteDocumentThunk = createAsyncThunk(
  "document/deleteDocument",
  async (documentId: number, { rejectWithValue }) => {
    const session = await getSession();
    try {
      const response = await ApiService.apiCall(
        "delete",
        `/documents/${documentId}`,
        {},
        session?.accessToken,
      );
      if (response.status === 204) {
        return documentId;
      } else {
        throw new Error("Failed to delete document");
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);
