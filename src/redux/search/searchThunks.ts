import { RootState } from "@/store/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const search = createAsyncThunk<
  any,
  any,
  { state: RootState; rejectValue: string }
>("search/search", async (payload, { getState, rejectWithValue }) => {
  const { isSearchForAll, query } = payload.payload;
  const { selectedDocuments, activeDocument } = getState().projectDocuments;
  const { searchResults } = getState().search;
  if (!query) {
    return rejectWithValue("Query is required.");
  }

  if (!selectedDocuments || !Array.isArray(selectedDocuments)) {
    return rejectWithValue("Selected documents are missing or not valid.");
  }

  let pdfBlobUrls: string[] = [];

  if (isSearchForAll) {
    pdfBlobUrls = selectedDocuments
      .filter(
        (doc: any) => !searchResults[doc.url.split("/").pop().split(".")[0]],
      )
      .map((doc: any) => doc.url as string);
  } else if (activeDocument?.url) {
    pdfBlobUrls.push(activeDocument.url);
  } else {
    return rejectWithValue("No PDF URLs found.");
  }

  if (pdfBlobUrls.length === 0) {
    return rejectWithValue("No valid PDF URLs found.");
  }

  const url = `${process.env.NEXT_PUBLIC_AZURE_FUNCTION_URL}`;

  const azureFunctionKey = process.env.NEXT_PUBLIC_AZURE_SEARCH_FUNCTION_KEY;
  if (!azureFunctionKey) {
    return rejectWithValue("Azure Function key is missing.");
  }

  try {
    payload.meta = { isSearchRequest: true };
    
    const response = await axios.post(url, {
      pdf_blob_urls: pdfBlobUrls,
      query: query,
    });
    
    return response.data.results;
  } catch (error: any) {
    if (error.response) {
      return rejectWithValue(
        error.response.data || "Error calling Azure Function.",
      );
    }

    return rejectWithValue(error.message || "Unexpected error occurred.");
  }
});
