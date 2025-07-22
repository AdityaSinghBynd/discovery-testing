import { BASE_URL } from "@/constant/constant";
import ApiService from "@/services/service";
import { RootState } from "@/store/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getSession } from "next-auth/react";

interface Tab {
  id: string;
  isOpen: boolean;
}

export const saveTabs = createAsyncThunk<Tab[], Tab[], { rejectValue: string }>(
  "tabs/saveTabs",
  async (tabs, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}tabs/save`, tabs);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Unknown error");
    }
  },
);
