import { ApiService } from "@/services/service";
import { RootState } from "@/store/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getSession } from "next-auth/react";

export const fetchSimilarTables = createAsyncThunk<
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

export const fetchPreviewData = createAsyncThunk<
  any,
  {data: any, tableId: string},
  { state: RootState; rejectValue: string }
>("documents/fetchPreviewData", async ({data, tableId}, { getState, rejectWithValue }) => {
  const session = await getSession();
  const { previewData } = getState().similarTables;
  const preview = previewData[tableId];
  if(preview) {
    return rejectWithValue("Preview data is already present!!");
  }
  try {
    const previewResponse = await axios.post(`${process.env.NEXT_PUBLIC_PREVIEW_DATA_API_URL}`, {
      data,
      tableId
    }, {
      headers: {
        'Authorization': `Bearer ${session?.accessToken}`
      }
    });
    const response = {[data[1].documentType]: {[data[1].year]: previewResponse.data}};
    return {data: response, tableId};
  } catch (error) {
    return rejectWithValue("Internal server Error!!");
  }
});