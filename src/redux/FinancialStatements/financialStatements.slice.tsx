import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchFinancialData,
  fetchFinancialDataFromUrl,
} from "./financialStatements.thunks";

interface FinancialData {
  data: any;
  loading: boolean;
  error?: string;
  selectedCategory: string;
}

interface FinancialStatementsState {
  financialData: Record<string, FinancialData>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: FinancialStatementsState = {
  financialData: {},
  status: "idle",
  error: null,
};

// Helper function to update financial data state
const updateFinancialData = (
  state: FinancialStatementsState,
  id: string,
  data: Partial<FinancialData>,
) => {
  state.financialData = {
    ...state.financialData,
    [id]: {
      ...state.financialData[id],
      ...data,
    },
  };
};

const financialStatementsSlice = createSlice({
  name: "financialStatements",
  initialState,
  reducers: {
    clearFinancialData: (state) => {
      state.financialData = {};
      state.status = "idle";
      state.error = null;
    },
    setCurrency: (state, action: PayloadAction<{ id: string; targetedCurrency: string }>) => {
      const { id , targetedCurrency } = action.payload;
      const selectedCategory = state.financialData[id]?.selectedCategory;
      if(state.financialData[id]?.data?.data?.[selectedCategory]) {
        state.financialData[id].data.data[selectedCategory].targetCurrency = targetedCurrency;
      }
    },
    setUnit: (state, action: PayloadAction<{ id: string; unit: string }>) => {
      const { id , unit } = action.payload;
      const selectedCategory = state.financialData[id]?.selectedCategory;
      if(state.financialData[id]?.data?.data?.[selectedCategory]) {
        state.financialData[id].data.data[selectedCategory].targetUnit = unit;
      }
    },
    setDecimal: (state, action: PayloadAction<{ id: string; decimal: number }>) => {
      const { id, decimal } = action.payload;
      const selectedCategory = state.financialData[id]?.selectedCategory;
      if(state.financialData[id]?.data?.data?.[selectedCategory]) {
        state.financialData[id].data.data[selectedCategory].decimal = decimal;
      }
    },
    setSelectedCategory: (state, action: PayloadAction<{ id: string; selectedCategory: string }>) => {
      const { id, selectedCategory } = action.payload;
      if (state.financialData[id]) {
        state.financialData[id].selectedCategory = selectedCategory;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinancialData.pending, (state, action) => {
        const id = action.meta.arg.id;
        state.status = "loading";
        updateFinancialData(state, id, {
          data: null,
          loading: true,
          error: undefined,
        });
      })
      .addCase(fetchFinancialData.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        state.status = "succeeded";
        updateFinancialData(state, id, {
          data: data,
          loading: false,
          error: undefined,
        });
      })
      .addCase(fetchFinancialData.rejected, (state, action) => {
        const id = action.meta.arg.id;
        const errorMessage =
          action.error.message || "Error fetching financial data";
        state.status = "failed";
        state.error = errorMessage;
        updateFinancialData(state, id, {
          data: null,
          loading: false,
          error: errorMessage,
        });
      })
      .addCase(fetchFinancialDataFromUrl.pending, (state, action) => {
        const id = action.meta.arg.id;
        state.status = "loading";
        updateFinancialData(state, id, {
          data: null,
          loading: true,
          error: undefined,
        });
      })
      .addCase(fetchFinancialDataFromUrl.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        state.status = "succeeded";
        updateFinancialData(state, id, {
          data: data,
          loading: false,
          error: undefined,
        });
      })
      .addCase(fetchFinancialDataFromUrl.rejected, (state, action) => {
        const id = action.meta.arg.id;
        const errorMessage =
          action.error.message || "Error fetching financial data";
        state.status = "failed";
        state.error = errorMessage;
        updateFinancialData(state, id, {
          data: null,
          loading: false,
          error: errorMessage,
        });
      });
  },
});

export const { clearFinancialData, setCurrency, setSelectedCategory, setUnit, setDecimal } = financialStatementsSlice.actions;
export default financialStatementsSlice.reducer;
