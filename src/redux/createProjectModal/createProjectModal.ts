import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
};

export const createProjectModalSlice = createSlice({
  name: "createProjectModal",
  initialState,
  reducers: {
    setIsOpen: (state, action) => {
      state.isOpen = action.payload;
    },
  },
});

export const { setIsOpen } = createProjectModalSlice.actions;

export default createProjectModalSlice.reducer;
