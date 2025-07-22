import { createSlice } from "@reduxjs/toolkit";

interface Company {
  id: string;
  name: string;
  documentCount: number;
  documents: any[];
}

interface CompaniesState {
  isDocument: boolean;
  currentCompany: string;
  companyLists: {
    [key: string]: Company[]; // key will be documentType
  };
  loading: boolean;
  error: string | null;
}

const initialState: CompaniesState = {
  isDocument: false,
  currentCompany: "",
  companyLists: {},
  loading: false,
  error: null,
};

const companiesSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    setIsDocument(state, action) {
      state.isDocument = action.payload;
    },
    setCurrentCompany(state, action) {
      state.currentCompany = action.payload;
    },
    setCompanyList(state, action) {
      const { documentType, companies } = action.payload;
      state.companyLists[documentType] = companies;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export default companiesSlice.reducer;
export const { 
  setIsDocument, 
  setCurrentCompany, 
  setCompanyList,
  setLoading,
  setError 
} = companiesSlice.actions;
