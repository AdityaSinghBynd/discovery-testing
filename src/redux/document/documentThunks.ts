import ApiService from "@/services/service";
import { RootState } from "@/store/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSession } from "next-auth/react";

export const fetchDocument = createAsyncThunk<
  any,
  void,
  { state: RootState; rejectValue: string }
>("document/fetchDocument", async (_, { getState, rejectWithValue }) => {
  const session = await getSession();
  const { documents } = getState().documents;

  if (documents.length > 0) {
    return rejectWithValue("Dcouments already exists");
  }

  try {
    const response = await ApiService.apiCall(
      "get",
      "/documents",
      {},
      session?.accessToken,
    );

    return response.data.data;
  } catch (error) {
    return rejectWithValue(`Internal server error`);
  }
});

export const fetchDocumentByCompany = createAsyncThunk<
  any,
  void,
  { state: RootState; rejectValue: string }
>("document/fetchDocument", async (_, { getState, rejectWithValue }) => {
  const session = await getSession();
  const { documents } = getState().documents;

  if (documents.length > 0) {
    return rejectWithValue("Dcouments already exists");
  }

  try {
    const response = await ApiService.apiCall(
      "get",
      "/documents",
      {},
      session?.accessToken,
    );

    return response.data.data;
  } catch (error) {
    return rejectWithValue(`Internal server error`);
  }
});

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

export const fetchSections = createAsyncThunk<
  any,
  any,
  { state: RootState; rejectValue: string }
>(
  "documents/fetchSections",
  async (documentId, { getState, rejectWithValue }) => {
    const session = await getSession();
    try {
      const response = await ApiService.apiCall(
        "get",
        `/documents/index/${documentId}`,
        {},
        session?.accessToken,
      );
      return { id: documentId, data: response.data.documents[0]?.sections };
    } catch (error) {
      return rejectWithValue("Internal server Error!!");
    }
  },
);
