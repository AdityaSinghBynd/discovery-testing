import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WorkspaceFilterState {
  hiddenSections: string[];
  allSections: string[];
}

const initialState: WorkspaceFilterState = {
  hiddenSections: [],
  allSections: [],
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setAllWorkspaceSections: (state, action: PayloadAction<string[]>) => {
      state.allSections = action.payload;
    },
    toggleWorkspaceSectionVisibility: (
      state,
      action: PayloadAction<string>,
    ) => {
      const section = action.payload;
      if (state.hiddenSections.includes(section)) {
        state.hiddenSections = state.hiddenSections.filter(
          (s) => s !== section,
        );
      } else {
        state.hiddenSections.push(section);
      }
    },
    toggleAllWorkspaceSections: (state) => {
      if (state.hiddenSections.length === state.allSections.length) {
        state.hiddenSections = [];
      } else {
        state.hiddenSections = [...state.allSections];
      }
    },
    resetWorkspaceFilters(state) {
      state.hiddenSections = [];
    },
  },
});

export const {
  setAllWorkspaceSections,
  toggleWorkspaceSectionVisibility,
  toggleAllWorkspaceSections,
  resetWorkspaceFilters,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
