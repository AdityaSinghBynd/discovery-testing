import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getResearchReports, getResearchReportsByBroker } from "./researchReportThunks";

interface ResearchReportState {
  researchReports: any[];
  researchReportsByBroker: any[];
  isLoading: boolean;
  isSearch: boolean;
  search: string;
  filters: {
    sector: string;
    broker: string;
    subAction: string;
    search: string;
  };
}

const initialState: ResearchReportState = {
  researchReports: [],
  researchReportsByBroker: [],
  isLoading: false,
  isSearch: false,
  search: "",
  filters: {
    sector: "",
    broker: "",
    subAction: "",
    search: ""
  }
};

const researchReportSlice = createSlice({
  name: "researchReport",
  initialState,
  reducers: {
    setResearchReports: (state, action: PayloadAction<any[]>) => {
      state.researchReports = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getResearchReports.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getResearchReports.fulfilled, (state, action: any) => {
        state.isLoading = false;
        const isSameSearch =JSON.stringify(action.payload.filters) === JSON.stringify(state.filters)&& action.payload.isSearch === state.isSearch && 
                           action.payload.search === state.search;
        
        state.researchReports = isSameSearch 
          ? [...state.researchReports, ...action.payload.data]
          : action.payload.data;
          
        state.isSearch = action.payload.isSearch;
        state.search = action.payload.search;
        state.filters = action.payload.filters;
      })
      .addCase(getResearchReports.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getResearchReportsByBroker.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getResearchReportsByBroker.fulfilled, (state, action: any) => {
        state.isLoading = false;
        
        const isSameSearch = JSON.stringify(action.payload.filters) === JSON.stringify(state.filters) && 
                           action.payload.isSearch === state.isSearch && 
                           action.payload.search === state.search;
        
        state.researchReportsByBroker = isSameSearch
          ? [...state.researchReportsByBroker, ...action.payload.data]
          : action.payload.data;
        
        state.isSearch = action.payload.isSearch;
        state.search = action.payload.search;
        state.filters = action.payload.filters;
      })
      .addCase(getResearchReportsByBroker.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setResearchReports } = researchReportSlice.actions;
export default researchReportSlice.reducer;
