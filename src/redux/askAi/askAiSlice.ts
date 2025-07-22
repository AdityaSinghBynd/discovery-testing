import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatMessage {
  text: string;
  isUser: boolean;
  chartData: any | null;
  chartType: string;
  loaded: boolean;
}

interface AskAiState {
  chatMessages: ChatMessage[];
  isLoading: boolean;
  editableData: Record<string, string>[];
  tableData: Record<string, string>[];
  isOpen: boolean;
  isClose: boolean;
  selectedData: any;
}

const initialState: AskAiState = {
  chatMessages: [
    {
      text: "How can I assist you?",
      isUser: false,
      chartData: null,
      chartType: "",
      loaded: false,
    },
  ],
  isLoading: false,
  editableData: [],
  tableData: [],
  isOpen: false,
  isClose: false,
  selectedData: {},
};

export const askAiSlice = createSlice({
  name: "askAi",
  initialState,
  reducers: {
    addChatMessage: (
      state,
      action: PayloadAction<{
        text: string;
        isUser: boolean;
        chartData?: any;
        chartType?: string;
        loaded?: boolean;
      }>,
    ) => {
      const {
        text,
        isUser,
        chartData = null,
        chartType = "",
        loaded = false,
      } = action.payload;
      state.chatMessages.push({ text, isUser, chartData, chartType, loaded });
    },
    setIsOpen: (state) => {
      state.isClose = false;
      state.isOpen = true;
    },
    setIsClose: (state) => {
      state.isOpen = false;
      state.isClose = true;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setEditableData: (
      state,
      action: PayloadAction<Record<string, string>[]>,
    ) => {
      state.editableData = action.payload;
      state.tableData = action.payload;
    },
    setSelectedData: (state, action: PayloadAction<Record<string, any>>) => {
      state.selectedData = action.payload;
    },
    updateEditableCell: (
      state,
      action: PayloadAction<{
        rowIndex: number;
        colKey: string;
        value: string;
      }>,
    ) => {
      const { rowIndex, colKey, value } = action.payload;
      state.editableData[rowIndex][colKey] = value;
    },
    resetChat: (state) => {
      state.chatMessages = [
        {
          text: "How can I assist you?",
          isUser: false,
          chartData: null,
          chartType: "",
          loaded: false,
        },
      ];
    },
  },
});

export const {
  addChatMessage,
  setIsOpen,
  setIsClose,
  setLoading,
  setEditableData,
  updateEditableCell,
  resetChat,
  setSelectedData,
} = askAiSlice.actions;

export default askAiSlice.reducer;
