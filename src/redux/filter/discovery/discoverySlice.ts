import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DiscoveryFilterState {
  hiddenSections: string[];
  hiddenSubsections: { [key: string]: string[] };
  allSections: string[];
}

const initialState: DiscoveryFilterState = {
  hiddenSections: [],
  hiddenSubsections: {},
  allSections: [],
};

const discoverySlice = createSlice({
  name: "discovery",
  initialState,
  reducers: {
    setAllDiscoverySections: (state, action: PayloadAction<string[]>) => {
      state.allSections = action.payload;
    },
    toggleDiscoverySectionVisibility: (
      state,
      action: PayloadAction<string>,
    ) => {
      const section = action.payload;
      if (state.hiddenSections.includes(section)) {
        state.hiddenSections = state.hiddenSections.filter(
          (s) => s !== section,
        );
        delete state.hiddenSubsections[section];
      } else {
        state.hiddenSections.push(section);
      }
    },
    toggleAllDiscoverySections: (state) => {
      if (state.hiddenSections.length === state.allSections.length) {
        state.hiddenSections = [];
        state.hiddenSubsections = {};
      } else {
        state.hiddenSections = [...state.allSections];
      }
    },
    toggleDiscoverySubsectionVisibility(
      state,
      action: PayloadAction<{
        section: string;
        subsection: string;
        totalSubsections: number;
      }>,
    ) {
      const { section, subsection, totalSubsections } = action.payload;

      if (!state.hiddenSubsections[section]) {
        state.hiddenSubsections[section] = [];
      }
      const index = state.hiddenSubsections[section].indexOf(subsection);

      if (index > -1) {
        state.hiddenSubsections[section].splice(index, 1);
        if (state.hiddenSubsections[section].length === 0) {
          delete state.hiddenSubsections[section];
          state.hiddenSections = state.hiddenSections.filter(
            (s) => s !== section,
          );
        }
      } else {
        state.hiddenSubsections[section].push(subsection);
        if (state.hiddenSubsections[section].length === totalSubsections) {
          if (!state.hiddenSections.includes(section)) {
            state.hiddenSections.push(section);
          }
        }
      }
    },
    resetDiscoveryFilters(state) {
      state.hiddenSections = [];
      state.hiddenSubsections = {};
    },
  },
});

export const {
  setAllDiscoverySections,
  toggleAllDiscoverySections,
  toggleDiscoverySectionVisibility,
  toggleDiscoverySubsectionVisibility,
  resetDiscoveryFilters,
} = discoverySlice.actions;

export default discoverySlice.reducer;
