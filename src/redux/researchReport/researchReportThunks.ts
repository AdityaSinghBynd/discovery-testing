import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getSession } from "next-auth/react";
import { BASE_URL } from "../../constant/constant";

export const getResearchReports = createAsyncThunk(
  "researchReport/getResearchReports",
  async ({
    page = 1,
    limit = 10,
    filters = {},
  }: {
    page: number;
    limit: number;
    filters?: Record<string, any>;
  }) => {
    const session = await getSession();
    
    filters.reportId = 3;
    // Build query params
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      filters: JSON.stringify(filters).replace(/ /g, '_')
    });

    const response = await axios.get(
      `${BASE_URL}/research-reports?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    );
    
    return {
      data: response.data.data,
      page: page,
      total: response.data.total,
      isSearch: filters.search ? true : false,
      search: filters.search,
      filters: filters
    };
  }
);

export const getResearchReportsByBroker = createAsyncThunk(
  "researchReport/getResearchReportsByBroker",
  async ({
    page = 1,
    limit = 10,
    filters = {},
  }: {
    page: number;
    limit: number;
    filters?: Record<string, any>;
  }) => {
    const session = await getSession();
    const urlFilters = JSON.stringify(filters).replace(/ /g, '_');

    const response = await axios.get(
      `${BASE_URL}/research-reports/by-broker?page=${page}&limit=${limit}&filters=${urlFilters}`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    );
    
    return {
      data: response.data.data,
      isSearch: filters.search ? true : false,
      search: filters.search
    };
  }
);