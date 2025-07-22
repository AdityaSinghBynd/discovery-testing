import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
    id: string;
    text: string;
    isUser: boolean;
    isHtml?: boolean;
    filename?: string;
    chartImage?: string;
    chartExcel?: string;
    title?: string;
}

export interface AskAiState {
    selectedData: any;
    chatMessages: ChatMessage[];
    currentChart: ChatMessage | null;
    isChartLoading: boolean;
    chartError: string | null;
}

const initialState: AskAiState = {
    selectedData: null,
    chatMessages: [],
    currentChart: null,
    isChartLoading: false,
    chartError: null,
};

const askAiSlice = createSlice({
    name: 'askAi',
    initialState,
    reducers: {
        setSelectedData: (state, action: PayloadAction<any>) => {
            state.selectedData = action.payload;
        },
        addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
            state.chatMessages.push(action.payload);
        },
        setCurrentChart: (state, action: PayloadAction<ChatMessage | null>) => {
            state.currentChart = action.payload;
        },
        setChartLoading: (state, action: PayloadAction<boolean>) => {
            state.isChartLoading = action.payload;
        },
        setChartError: (state, action: PayloadAction<string | null>) => {
            state.chartError = action.payload;
        },
        clearChatMessages: (state) => {
            state.chatMessages = [];
            state.currentChart = null;
            state.chartError = null;
        },
    },
});

export const {
    setSelectedData,
    addChatMessage,
    setCurrentChart,
    setChartLoading,
    setChartError,
    clearChatMessages,
} = askAiSlice.actions;

export default askAiSlice.reducer; 