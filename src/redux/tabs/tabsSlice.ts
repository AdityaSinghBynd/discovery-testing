import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { saveTabs } from "./tabsThunks";

interface Tab {
  id: string;
  isOpen: boolean;
  [key: string]: any;
}

interface TabsState {
  tabs: Tab[];
  loading: boolean;
  error: string | null;
}

const initialState: TabsState = {
  tabs: [],
  loading: false,
  error: null,
};

// Create slice for tabs
const tabsSlice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    setTabs: (state, action: PayloadAction<Tab[]>) => {
      state.tabs = action.payload;
    },
    toggleTab: (state, action: PayloadAction<string>) => {
      const tab = state.tabs.find((tab) => tab.id === action.payload);
      if (tab) {
        tab.isOpen = !tab.isOpen;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveTabs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveTabs.fulfilled, (state, action: PayloadAction<Tab[]>) => {
        state.loading = false;
        state.tabs = action.payload;
      })
      .addCase(saveTabs.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "An error occurred while saving the tab";
      });
  },
});

export const { setTabs, toggleTab } = tabsSlice.actions;

export default tabsSlice.reducer;
