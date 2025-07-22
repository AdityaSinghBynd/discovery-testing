import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PageDimensionState = {
  width: number;
  height: number;
};

const initialState: PageDimensionState = {
  width: 0,
  height: 0,
};

export const pageDimensionSlice = createSlice({
  name: "pageDimension",
  initialState,
  reducers: {
    setPageDimensionState: (
      state,
      action: PayloadAction<PageDimensionState>,
    ) => {
      state.width = action.payload.width;
      state.height = action.payload.height;
    },
  },
});

export const { setPageDimensionState } = pageDimensionSlice.actions;

export default pageDimensionSlice.reducer;
