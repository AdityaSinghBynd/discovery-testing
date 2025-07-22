import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ElementState {
  count: number;
}

const initialState: ElementState = {
  count: 0,
};

const elementSlice = createSlice({
  name: "elements",
  initialState,
  reducers: {
    setElementCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
  },
});

export const { setElementCount } = elementSlice.actions;
export default elementSlice.reducer;
