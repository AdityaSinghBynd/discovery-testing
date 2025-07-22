import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { search } from "./searchThunks";

interface searchForAllToggle {
  searchForAll: boolean;
  isLoading: boolean;
  response: any;
  searchResults: Record<string, any>;
  query: string;
  searchResultsForAll: Record<string, any>;
}

const initialState: searchForAllToggle = {
  searchForAll: false,
  isLoading: false,
  response: null,
  searchResults: {},
  searchResultsForAll: {},
  query: "",
};

const searchSlice = createSlice({
  name: "searchForAll",
  initialState,
  reducers: {
    setSearchForAll: (state, action: PayloadAction<boolean>) => {
      state.searchForAll = action.payload;
    },
    searchResultsReset: (state) => {
      state.searchResults = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(search.pending, (state, action) => {
      state.isLoading = true;
      if (action.meta.arg.payload.isSearchForAll) {
        const sanitizedKey = action.meta.arg.payload.query.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 50);
        state.searchResultsForAll[sanitizedKey] = {
          loading: true,
          data: null,
          error: null
        };
      }
    });
    builder.addCase(search.fulfilled, (state, action) => {
      state.isLoading = false;
      const sanitizedPayload = Object.entries(action.payload).reduce((acc, [key, value]) => {
        const sanitizedKey = key.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 50);
        return { ...acc, [sanitizedKey]: value };
      }, {});
      
      state.response = Object.values(sanitizedPayload);
      state.searchResults = {
        ...state.searchResults,
        ...sanitizedPayload,
      };

        const sanitizedKey = action.meta.arg.payload.query.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 50);
        state.searchResultsForAll = {
          ...state.searchResultsForAll,
          [sanitizedKey]: {
            loading: false,
            data: sanitizedPayload,
            error: null
          }
      };
    });
    builder.addCase(search.rejected, (state, action) => {
      state.isLoading = false;
      if (action.meta.arg.payload.isSearchForAll) {
        const sanitizedKey = action.meta.arg.payload.query.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 50);
        state.searchResultsForAll = {
          ...state.searchResultsForAll,
          [sanitizedKey]: {
            loading: false,
            data: null,
            error: action.error.message || 'An error occurred'
          }
        };
      }
    });
  },
});

export const { setSearchForAll, searchResultsReset } = searchSlice.actions;
export default searchSlice.reducer;
