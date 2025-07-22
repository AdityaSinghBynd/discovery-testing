import ApiService from "@/services/service";
import { RootState } from "@/store/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSession } from "next-auth/react";

interface EditProjectParams {
  id: string;
  name: string;
  description: string;
}

export const editProjectThunk = createAsyncThunk(
  "projects/editProject",
  async ({ id, name, description }: EditProjectParams, { rejectWithValue }) => {
    try {
      const response = await ApiService.apiCall("patch", `/projects/${id}`, {
        name: name,
        description,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to edit project");
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

export const fetchProjects = createAsyncThunk<
  any,
  void,
  { state: RootState; rejectValue: string }
>("project/fetchData", async (_, { getState, rejectWithValue }) => {
  const session = await getSession();

  const { projects } = getState().projects;
  if (projects.length > 0) {
    return rejectWithValue("Data already exists");
  }

  try {
    const response = await ApiService.apiCall(
      "get",
      "/projects",
      {},
      session?.accessToken,
    );

    return response.data.data;
  } catch (error) {
    return rejectWithValue("Failed to fetch data");
  }
});
