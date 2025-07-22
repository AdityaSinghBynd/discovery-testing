import { RootState } from "@/store/store";

export const selectTextChunks = (state: RootState) => state.chunks.textChunks;
export const selectTableChunks = (state: RootState) => state.chunks.tableChunks;
export const selectGraphChunks = (state: RootState) => state.chunks.graphChunks;
export const selectChunksStatus = (state: RootState) => state.chunks.status;
export const selectChunksError = (state: RootState) => state.chunks.error;
