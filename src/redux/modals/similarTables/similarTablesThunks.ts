import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getSession } from 'next-auth/react';
import { SIMILAR_TABLES_API_URL } from '@/constant/constant';
import { baseUrl } from '@/utils/utils';
import { CombinedTablesPayload, CombinedTablesResponse } from './similiartable.interface';

export interface FetchSimilarTablesPayload {
  sourceUrl: string;
  tableId: string;
  pageNumber: number;
  compatiorUrls: string[];
}

export interface SimilarTablesResponse {
  [key: string]: any;
}

export interface FetchSimilarTablesResponse {
  tableId: string;
  pageNumber: number;
  data: SimilarTablesResponse;
}

export interface FetchPreviewDataResponse {
  data: any;
}

// ============================================================================
// API UTILITY FUNCTIONS
// ============================================================================

/**
 * Attempts to fetch processed similar tables data from cache
 */
const fetchProcessedSimilarTables = async (
  sourceUrl: string,
  tableId: string
): Promise<SimilarTablesResponse | null> => {
  try {
    const processedUrl = `${baseUrl(sourceUrl)}/Processed/SimilarTables/${tableId}.json`;
    const response = await fetch(processedUrl);

    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.info('Processed data not available, will fall back to API');
    return null;
  }
};

/**
 * Fetches similar tables data from the API
 */
const fetchSimilarTablesFromAPI = async (
  payload: FetchSimilarTablesPayload,
  accessToken: string | undefined
): Promise<SimilarTablesResponse> => {
  const { sourceUrl, tableId, pageNumber, compatiorUrls } = payload;

  const response = await axios.post(
    SIMILAR_TABLES_API_URL,
    {
      table_id: tableId,
      competitor_pdf_urls: compatiorUrls,
      source_pdf: sourceUrl,
      page_number: pageNumber,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data?.result || {};
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Fetches similar tables data with fallback strategy:
 * 1. Try to fetch from processed/cached data
 * 2. If not available, fetch from API
 */
export const fetchSimilarTables = createAsyncThunk<
  FetchSimilarTablesResponse,
  FetchSimilarTablesPayload
>(
  'similarTables/fetchSimilarTables',
  async (payload, { rejectWithValue }) => {
    const { sourceUrl, tableId, pageNumber } = payload;

    try {
      const session = await getSession();

      // Step 1: Try to fetch from processed data first
      const processedData = await fetchProcessedSimilarTables(sourceUrl, tableId);

      if (processedData) {
        console.info(`Successfully fetched processed data for table ${tableId}`);
        return {
          tableId,
          pageNumber,
          data: processedData,
        };
      }

      // Step 2: Fallback to API call
      console.info(`Fetching from API for table ${tableId}`);
      const apiData = await fetchSimilarTablesFromAPI(payload, session?.accessToken);

      return {
        tableId,
        pageNumber,
        data: apiData,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch similar tables';
      console.error('Error fetching similar tables:', {
        tableId,
        error: errorMessage,
        payload,
      });

      return rejectWithValue({
        message: errorMessage,
        tableId,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Fetches preview data for a specific table
 * TODO: Implement actual preview data fetching logic based on your API
 */
export const fetchPreviewData = createAsyncThunk<
  CombinedTablesResponse,
  CombinedTablesPayload
>(
  'similarTables/fetchPreviewData',
  async (payload: CombinedTablesPayload, { rejectWithValue }) => {
    try {
      const session = await getSession();

      const response = await axios.post(`https://backend-staging.bynd.ai/django/api/join-similar-tables/`, payload, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.data) {
        throw new Error('No preview data received');
      }

      return response.data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch preview data';
      console.error('Error fetching preview data:', error);
      
      return rejectWithValue({
        message: errorMessage,
        timestamp: new Date().toISOString(),
      });
    }
  }
);
