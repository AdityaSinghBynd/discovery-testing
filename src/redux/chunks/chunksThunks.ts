import { ApiService } from "@/services/service";
import { RootState } from "@/store/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSession } from "next-auth/react";

export const fetchTextChunks = createAsyncThunk<
  any,
  any,
  { state: RootState; rejectValue: string }
>("documents/fetchText", async (documentId, { getState, rejectWithValue }) => {
  const session = await getSession();
  const { tableData } = getState().documents;
  const { id } = tableData;

  if (id === documentId) {
    return rejectWithValue("Graph Data is Presenet with this document Id!!");
  }
  try {
    const response = await ApiService.apiCall(
      "get",
      `/documents/text/${documentId}`,
      {},
      session?.accessToken,
    );

    return { id: documentId, data: response.data };
  } catch (error) {
    return rejectWithValue("Internal server Error!!");
  }
});

export const fetchTableChunks = createAsyncThunk<
  any,
  any,
  { state: RootState; rejectValue: string }
>("documents/fetchGraph", async (documentId, { getState, rejectWithValue }) => {
  const session = await getSession();
  const { tableData } = getState().documents;
  const { id } = tableData;

  if (id === documentId) {
    return rejectWithValue("Graph Data is Presenet with this document Id!!");
  }
  try {
    const tableResponse = await ApiService.apiCall(
      "get",
      `/documents/table/${documentId}`,
      {},
      session?.accessToken,
    );

    return { id: documentId, data: tableResponse.data };
  } catch (error) {
    return rejectWithValue("Internal server Error!!");
  }
});

export const fetchGraphChunks = createAsyncThunk<
  any,
  any,
  { state: RootState; rejectValue: string }
>("documents/fetchTable", async (documentId, { getState, rejectWithValue }) => {
  const session = await getSession();
  const { graphData } = getState().documents;
  const { id } = graphData;

  if (id === documentId) {
    return rejectWithValue("Graph Data is Presenet with this document Id!!");
  }
  try {
    const graphResponse = await ApiService.apiCall(
      "get",
      `/documents/graph/${documentId}`,
      {},
      session?.accessToken,
    );

    return { id: documentId, data: graphResponse.data };
  } catch (error) {
    return rejectWithValue("Internal server Error!!");
  }
});
