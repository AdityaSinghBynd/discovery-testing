import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  deleteProjectThunk,
  editProjectThunk,
  fetchProjects,
} from "./projectThunks";

interface ProjectState {
  projects: Array<any>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  status: "idle",
  error: null,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProjects(state, action: PayloadAction<Array<any>>) {
      state.projects = action.payload;
    },
    addProject(state, action: PayloadAction<any>) {
      state.projects.push(action.payload);
    },
    updateProject(state, action: PayloadAction<any>) {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    deleteProject(state, action: PayloadAction<string | number>) {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteProjectThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        deleteProjectThunk.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.status = "succeeded";
          state.projects = state.projects.filter(
            (p) => p.id !== action.payload,
          );
        },
      )
      .addCase(deleteProjectThunk.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(editProjectThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(editProjectThunk.fulfilled, (state, action: any) => {
        state.status = "succeeded";
        const index = state.projects.findIndex(
          (project) => action.payload.id === project.id,
        );

        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(editProjectThunk.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.projects = action.payload;
      })
      .addCase(fetchProjects.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProjects.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setProjects, addProject, updateProject, deleteProject } =
  projectSlice.actions;
export default projectSlice.reducer;
