import { createAsyncThunk } from "@reduxjs/toolkit";
import ApiService from "@/services/service";
import { getSession } from "next-auth/react";
import { RootState } from "@/store/store";
import axios from "axios";
import { BASE_URL } from "@/constant/constant";

interface DeleteProjectDocumentParams {
  id: string;
}

const handleApiCall = async (
  method: string,
  url: string,
  data: any = {},
  token: string | undefined,
) => {
  return await ApiService.apiCall(method, url, data, token);
};

const handleError = (error: any, defaultMessage: string) => {
  return error.response?.data || defaultMessage;
};

export const fetchProjectDocuments = createAsyncThunk<
  any,
  string,
  { state: RootState; rejectValue: string }
>(
  "projectDocuments/fetchProjectDocuments",
  async (projectId, { rejectWithValue }) => {
    try {
      const session = await getSession();
      const response = await handleApiCall(
        "get",
        `/project-documents/${projectId}`,
        {},
        session?.accessToken,
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleError(error, "Failed to fetch project"));
    }
  },
);

export const createProjectWithDocuments = createAsyncThunk<
  any,
  void,
  { state: RootState; rejectValue: string }
>(
  "projectDocuments/createProjectWithDocuments",
  async (_, { getState, rejectWithValue }) => {
    const { selectedDocuments } = getState().projectDocuments;
    if (!selectedDocuments.length)
      return rejectWithValue("No documents selected");

    const documentIds = selectedDocuments.map((doc: any) => doc.id);
    try {
      const session = await getSession();
      const response = await handleApiCall(
        "post",
        "/project-documents",
        { documentIds },
        session?.accessToken,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        handleError(error, "Failed to create project with documents"),
      );
    }
  },
);
export const fetchProjectsByUserId = createAsyncThunk<
  any,
  { page: number; limit: number },
  { rejectValue: string }
>(
  "projectDocuments/fetchProjectsByUserId",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const session = await getSession();
      const response = await handleApiCall(
        "get",
        `/projects?page=${page}&limit=${limit}`,
        {},
        session?.accessToken,
      );

      return {
        projects: response.data.data,
        hasMore: response.data.hasNextPage,
      };
    } catch (error: any) {
      return rejectWithValue(handleError(error, "Failed to fetch projects"));
    }
  },
);

export const deleteProjectDocument = createAsyncThunk<
  any,
  DeleteProjectDocumentParams,
  { rejectValue: string }
>(
  "projectDocuments/deleteProjectDocument",
  async ({ id }, { rejectWithValue }) => {
    try {
      const session = await getSession();
      await handleApiCall(
        "delete",
        `/project-documents/${id}`,
        {},
        session?.accessToken,
      );
      return { id };
    } catch (error: any) {
      return rejectWithValue(
        handleError(error, "Failed to delete project document"),
      );
    }
  },
);

export const addProjectDocument = createAsyncThunk<
  any,
  any,
  { rejectValue: string }
>(
  "projectDocuments/addProjectDocument",
  async ({ projectId, documentIds }, { rejectWithValue }) => {
    try {
      const session = await getSession();
      const response = await handleApiCall(
        "post",
        `/project-documents/projects/${projectId}/documents`,
        { documentIds },
        session?.accessToken,
      );
      if (response.status === 201) {
        return response.data.data;
      }
      return rejectWithValue("Failed to add document to project");
    } catch (error: any) {
      return rejectWithValue(
        handleError(error, "Failed to add document to project"),
      );
    }
  },
);

export const fetchProject = createAsyncThunk<
  any,
  string,
  { state: RootState; rejectValue: string }
>("projectDocuments/fetchProject", async (projectId, { rejectWithValue }) => {
  try {
    const session = await getSession();
    const response = await handleApiCall(
      "get",
      `/projects/${projectId}`,
      {},
      session?.accessToken,
    );

    console.log("response-------->", response);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(handleError(error, "Failed to fetch project"));
  }
});

export const updateProject = createAsyncThunk<
  any,
  {
    payload: {
      name?: string;
      projectId?: string;
      tabSelected?: string;
      recentSearch?: string;
      isSearched?: boolean;
      isSearchForAll?: boolean;
    };
  },
  { state: RootState; rejectValue: string }
>(
  "projectDocuments/updateProject",
  async ({ payload }, { getState, rejectWithValue }) => {
    try {
      const { name, projectId } = payload;
      const state = getState();

      const Id = projectId || state.projectDocuments.projectId;

      if (!Id) {
        return rejectWithValue("Project ID is required to update the project.");
      }

      const session = await getSession();
      const response = await axios.put(`${BASE_URL}/projects/${Id}`, payload, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleError(error, "Failed to update project"));
    }
  },
);

export const deleteProjectThunk = createAsyncThunk(
  "project/deleteProject",
  async (projectId: number, { rejectWithValue }) => {
    const session = await getSession();
    try {
      const response = await ApiService.apiCall(
        "delete",
        `/projects/${projectId}`,
        {},
        session?.accessToken,
      );
      if (response.status === 204) {
        return projectId;
      } else {
        throw new Error("Failed to delete project");
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchProjectDocumentsByProjectId = createAsyncThunk<
  any,
  string,
  { state: RootState; rejectValue: string }
>(
  "projectDocuments/fetchProjectDocumentsByProjectId",
  async (projectId, { rejectWithValue }) => {
    try {
      const session = await getSession();
      const response = await handleApiCall(
        "get",
        `/project-documents/projects/${projectId}`,
        {},
        session?.accessToken,
      );
      
      return response.data;
    } catch (error: any) {
      if (error.response.status === 403) {
        window.location.href = "/";
      }
      return rejectWithValue(
        handleError(error, "Failed to fetch project documents"),
      );
    }
  },
);

export const fetchProjectDocumentList = createAsyncThunk<
  any,
  string,
  { state: RootState; rejectValue: string }
>(
  "projectDocuments/fetchProjectDocumentList",
  async (projectId, { getState, rejectWithValue }) => {
    const projectDocumentList = getState().projectDocuments.projectDocumentList;
    if (projectDocumentList[String(projectId)]) {
      return rejectWithValue("Documents for this project is already exists");
    }
    try {
      const session = await getSession();
      const response = await handleApiCall(
        "get",
        `/project-documents/projects/${projectId}`,
        {},
        session?.accessToken,
      );
      return {
        id: projectId,
        data: response.data,
      };
    } catch (error: any) {
      return rejectWithValue(
        handleError(error, "Failed to fetch project documents"),
      );
    }
  },
);

export const fetchPdf = createAsyncThunk<
  any,
  any,
  { state: RootState; rejectValue: string }
>("documents/fetchPdf", async (documentId, { getState, rejectWithValue }) => {
  const session = await getSession();
  const selectedDocuments = getState().projectDocuments.selectedDocuments;
  const index = selectedDocuments.findIndex(
    (doc: any) => doc.id === Number(documentId),
  );
  const url = selectedDocuments[index].url;
  const pdfUrl = selectedDocuments[index].pdfUrl;
  if (pdfUrl) {
    return { id: documentId, data: pdfUrl };
  }
  try {
    const response = await axios.get("/api/fetch-pdf", {
      params: { file_url: url },
    });
    return { id: documentId, data: response.data };
  } catch (error) {
    return rejectWithValue("Internal server Error!!");
  }
});

export const deleteTab = createAsyncThunk<
  any,
  { payload: { documentId?: string; projectId?: string } },
  { state: RootState; rejectValue: string }
>("tabs/deleteTab", async ({ payload }, { rejectWithValue }) => {
  const { documentId, projectId } = payload;

  try {
    const session = await getSession();
    const response = await ApiService.apiCall(
      "delete",
      `${BASE_URL}/project-documents/projects/${projectId}/documents/${documentId}`,
      session?.accessToken,
    );
    return documentId;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Unknown error");
  }
});

export const updateDocument = createAsyncThunk<
  any,
  {
    documentId: string | number;
    projectId: string;
    payload: { isActive?: boolean; lockedPage?: number };
  },
  { state: RootState; rejectValue: string }
>(
  "documents/syncPageLock",
  async ({ documentId, projectId, payload }, { rejectWithValue }) => {
    try {
      const session = await getSession();
      const response = await axios.patch(
        `${BASE_URL}/project-documents/projects/${projectId}/documents/${documentId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      );

      if (response.status === 200) {
        return {
          documentId,
          lockedPage: payload.lockedPage,
          isActive: payload.isActive,
        };
      }
      return rejectWithValue("Failed to sync page lock with backend");
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to sync page lock with backend",
      );
    }
  },
);
