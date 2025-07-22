import ApiService from "@/services/service";
import { RootState } from "@/store/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSession } from "next-auth/react";
import { hasNextPage } from "./selector";

interface FetchElementsParams {
  workspaceId: string | number;
  page: number;
}

export const fetchElementsByWorkspaceId = createAsyncThunk<
  any,
  FetchElementsParams,
  { state: RootState; rejectValue: string }
>(
  "elements/fetchElement",
  async ({ workspaceId, page }, { getState, rejectWithValue }) => {
    const session = await getSession();
    try {
      const filters = encodeURIComponent(JSON.stringify({ workspaceId }));
      const response = await ApiService.apiCall(
        "get",
        `/elements?filters=${filters}&page=${page}&limit=10`,
        {},
        session?.accessToken,
      );
      return {
        workspaceId: workspaceId,
        hasNextPage: response.data.hasNextPage,
        elements: response.data.data,
      };
    } catch (error) {
      return rejectWithValue("Failed to fetch data");
    }
  },
);

export const addElement = createAsyncThunk<
  any,
  any,
  { state: RootState; rejectValue: string }
>("elements/addElement", async (payload, { getState, rejectWithValue }) => {
  const session = await getSession();
  const { elementsByWorkspaceId } = getState().elements;

  try {
    const response = await ApiService.apiCall(
      "post",
      `/elements`,
      payload,
      session?.accessToken,
    );
    return response?.data;
  } catch (error) {
    console.error("Error adding element:", error);
    return rejectWithValue("Internal server Error!");
  }
});
