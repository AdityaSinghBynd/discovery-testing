import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import projectReducer from "@/redux/project/projectSlice";
import documentReducer from "@/redux/document/documentSlice";
import elementsReducer from "@/redux/element/elementSlice";
import askAiReducer from "@/redux/askAi/askAiSlice";
import pageDimensionsReducer from "@/redux/pageDimension/pageDimensionSlice";
import discoveryReducer from "@/redux/filter/discovery/discoverySlice";
import workspaceReducer from "@/redux/filter/workspace/workspaceSlice";
import companiesReducer from "@/redux/companies/companiesSlice";
import searchReducer from "@/redux/search/searchSlice";
import projectDocumentsReducer from "@/redux/projectDocuments/projectDocumentsSlice";
import createProjectModalReducer from "@/redux/createProjectModal/createProjectModal";
import recentUploadedReducer from "@/redux/recentUploadedDocuments/recentUploadedSlice";
import summaryReducer from "@/redux/aiSummary/aiSummarySlice";
import chunksReducer from "@/redux/chunks/chunksSlice";
import financialStatementsReducer from "@/redux/FinancialStatements/financialStatements.slice";
import similarTablesReducer from "@/redux/similarTables/similarTablesSlice";
import similarTablesModalReducer from "@/redux/modals/similarTables/similarTablesSlice";
import researchReportReducer from "@/redux/researchReport/researchReportSlice";

const store = configureStore({
  reducer: {
    recentUploaded: recentUploadedReducer,
    workspace: workspaceReducer,
    discovery: discoveryReducer,
    chunks: chunksReducer,
    projects: projectReducer,
    documents: documentReducer,
    elements: elementsReducer,
    askAi: askAiReducer,
    pageDimensions: pageDimensionsReducer,
    companies: companiesReducer,
    search: searchReducer,
    researchReport: researchReportReducer,
    projectDocuments: projectDocumentsReducer,
    createProjectModal: createProjectModalReducer,
    summary: summaryReducer,
    financialStatements: financialStatementsReducer,
    similarTable: similarTablesReducer,
    similarTables: similarTablesModalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: [
          "documents.documents",
          "documents.graphData",
          "documents.indexData",
          "documents.textData",
          "documents.tableData",
          "documents.documentLists",
        ],
        ignoredActionPaths: ["payload"],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;
