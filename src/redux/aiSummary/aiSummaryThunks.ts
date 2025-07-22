import ApiService from "@/services/service";
import { RootState } from "@/store/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSession } from "next-auth/react";

export const fetchAiSummary = createAsyncThunk<
  any,
  any,
  { state: RootState; rejectValue: string }
>(
  "documents/fetchAiSummary",
  async (documentId, { getState, rejectWithValue }) => {
    const session = await getSession();
    const { summary } = getState().summary;
    const isExists = summary[documentId]?.documents;

    if (isExists) {
      return { id: documentId, data: summary[documentId] };
    }

    try {
      const response = await ApiService.apiCall(
        "get",
        `/documents/ai-summary/${documentId}`,
        {},
        session?.accessToken,
      );
      return { id: documentId, data: response.data };
    } catch (error) {
      return rejectWithValue("Internal server Error!!");
    }
  },
);
