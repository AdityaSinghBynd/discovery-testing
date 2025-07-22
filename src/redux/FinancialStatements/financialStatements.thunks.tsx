import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getSession } from "next-auth/react";

export const fetchFinancialData = createAsyncThunk(
  "financialStatements/fetchFinancialData",
  async (data: any, { rejectWithValue }) => {
    const session = await getSession();
    const token = session?.accessToken;
    if (!process.env.NEXT_PUBLIC_FINANCIAL_DATA_API_URL) {
      throw new Error("NEXT_PUBLIC_FINANCIAL_DATA_API_URL is not set");
    }
    const { pdf_url, id } = data;

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_FINANCIAL_DATA_API_URL + `${id}/`,
        { pdf_url },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return { data: response.data, id };
    } catch (error) {
      console.error("Error fetching financial data", error);
      return rejectWithValue({
        error: "Error fetching financial data",
        id: id,
      });
    }
  },
);

export const fetchFinancialDataFromUrl = createAsyncThunk(
  "financialStatements/fetchFinancialDataFromUrl",
  async (payload: any, { rejectWithValue }) => {
    const { blob_url, id } = payload;

    try {
      const response = await fetch(
        blob_url + "/Processed/FinancialStatements/financial-statements.json",
      );
      if (!response.ok) {
        throw new Error("Failed to fetch financial data");
      }
      const data = await response.json();

      return { data: { data: data }, id };
    } catch (error) {
      console.error("Error fetching financial data", error);
      return rejectWithValue({
        error: "Error fetching financial data",
        id: id,
      });
    }
  },
);
