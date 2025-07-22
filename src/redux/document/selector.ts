import { RootState } from "@/store/store";

export const selectDocumentsLoadingStatus = (state: RootState) =>
  state.documents.status;
export const getCurrentFileUrl = (state: RootState) =>
  state.documents.globalPdfUrl;
