import { RootState } from "@/store/store";

export const selectGraphData = (state: RootState) => state.documents.graphData;
export const selectTableData = (state: RootState) => state.documents.tableData;
export const selectTextData = (state: RootState) => state.documents.textData;
export const selectDocumentsLoadingStatus = (state: RootState) =>
  state.documents.status;
export const getCurrentFileUrl = (state: RootState) =>
  state.documents.globalPdfUrl;

export const getSelectedData = (state: RootState) => state.askAi.selectedData;
export const getOpenState = (state: RootState) => state.askAi.isOpen;
export const getCloseState = (state: RootState) => state.askAi.isClose;
