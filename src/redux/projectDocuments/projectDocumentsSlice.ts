import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchProjectsByUserId,
  addProjectDocument,
  deleteProjectDocument,
  fetchPdf,
  fetchProject,
  fetchProjectDocumentsByProjectId,
  updateProject,
  createProjectWithDocuments,
  deleteTab,
  deleteProjectThunk,
  updateDocument,
  fetchProjectDocumentList,
} from "@/redux/projectDocuments/projectDocumentsThunks";

interface Tab {
  id: string;
  isOpen: boolean;
  [key: string]: any;
}

interface ProjectDocumentsState {
  selectedDocuments: Record<string, any>[];
  items: Record<string, any>;
  hasMore: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  selectedProject: Record<string, any>;
  projectId: string;
  activeDocument: Record<string, any>;
  projectDocumentList: Record<string, any>;
}

const initialState: ProjectDocumentsState = {
  selectedDocuments: [],
  projectId: "",
  items: { projects: [] },
  hasMore: true,
  status: "idle",
  error: null,
  selectedProject: {},
  activeDocument: {},
  projectDocumentList: {},
};

const projectDocumentsSlice = createSlice({
  name: "projectDocuments",
  initialState,
  reducers: {
    setProjectDocumentList: (state) => { },
    setSelectedProjectDocuments: (state, action) => {
      const { id, name, status } = action.payload;
      const existingDocIndex = state.selectedDocuments.findIndex(doc => doc.id === id);

      if (existingDocIndex !== -1) {
        state.selectedDocuments = state.selectedDocuments.filter(doc => doc.id !== id);
      } else {
        // state.selectedDocuments = [...state.selectedDocuments, { id, name }];
        state.selectedDocuments = [...state.selectedDocuments, { id, name, isActive: false, status: status || "" }];
      }
    },

    setActiveDocuments: (state, action) => {
      const { id } = action.payload;

      const docIndex = state.selectedDocuments.findIndex(
        (doc) => doc.id === id,
      );

      if (docIndex === -1) return;

      state.selectedDocuments = state.selectedDocuments.map((doc) => ({
        ...doc,
        isActive: doc.id === id,
      }));
      
      state.activeDocument = state.selectedDocuments[docIndex];
    },

    removeSelectedDocument: (state, action) => {
      const documentId = action.payload;
      if (documentId) {
        state.selectedDocuments = state.selectedDocuments.filter(
          (doc) => doc.id !== documentId,
        );
      } else {
        state.selectedDocuments = [];
      }
    },

    updateActiveDocumentStatus: (state, action) => {
      const { status } = action.payload;
      if (state.activeDocument && state.activeDocument.id) {
        state.activeDocument = {
          ...state.activeDocument,
          status,
        };
        
        // Also update this document in the selectedDocuments array
        const docIndex = state.selectedDocuments.findIndex(
          doc => doc.id === state.activeDocument.id
        );
        
        if (docIndex !== -1) {
          state.selectedDocuments[docIndex] = {
            ...state.selectedDocuments[docIndex],
            status,
          };
        }
      }
    },

    reset: (state) => {
      const { items } = state;
      return { ...initialState, items };
    },
    setLocalPageLock: (state, action) => {
      const { documentId, lockedPage, isActive } = action.payload;

      state.selectedDocuments = state.selectedDocuments.map((doc) => {
        if (!doc || doc.id !== documentId) {
          return { ...doc, isActive: false };
        }
        return {
          ...doc,
          isActive: Boolean(isActive),
          lockedPage:
            typeof lockedPage !== "undefined"
              ? Number(lockedPage)
              : doc.lockedPage,
        };
      });

      const docIndex = state.selectedDocuments.findIndex(
        (doc) => doc?.id === documentId,
      );
      if (docIndex !== -1) {
        state.activeDocument = state.selectedDocuments[docIndex];
      }
    },

    setSearchState: (state, action) => {
      const { isSearchForAll, isSearched, recentSearch } = action.payload;
      
      if(state.selectedProject) {
        state.selectedProject = {
          ...state.selectedProject,
          isSearchForAll: isSearchForAll !== undefined ? isSearchForAll : state.selectedProject.isSearchForAll,
          isSearched: isSearched !== undefined ? isSearched : state.selectedProject.isSearched,
          recentSearch: recentSearch !== undefined ? recentSearch : state.selectedProject.recentSearch,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectDocumentList.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProjectDocumentList.fulfilled, (state, action) => {
        state.status = "succeeded";

        state.projectDocumentList = {
          ...state.projectDocumentList,
          [action.payload.id]: action.payload.data,
        };
      })
      .addCase(fetchProjectDocumentList.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(fetchProjectsByUserId.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProjectsByUserId.fulfilled, (state, action) => {
        state.status = "succeeded";

        if (action.meta.arg.page === 1) {
          state.items.projects = action.payload.projects;
        } else {
          state.items.projects = [
            ...(state.items.projects || []),
            ...action.payload.projects,
          ];
        }

        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchProjectsByUserId.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to fetch project documents";
      })
      .addCase(addProjectDocument.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addProjectDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedDocuments = action.payload;
        state.activeDocument =
          action.payload.find((doc: any) => doc.isActive) || {};
      })
      .addCase(addProjectDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to add project document";
      })
      .addCase(deleteProjectThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        deleteProjectThunk.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.status = "succeeded";
          state.items.projects = state.items.projects.filter(
            (project: any) => project.id !== action.payload,
          );
        },
      )
      .addCase(deleteProjectThunk.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteProjectDocument.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteProjectDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { [action.payload.id]: _, ...remainingItems } = state.items;
        state.items = remainingItems;
      })
      .addCase(deleteProjectDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to delete project document";
      })
      .addCase(fetchProject.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.projectId = action.payload.id;
        state.selectedProject = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to delete project document";
      })
      .addCase(updateProject.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.projects = state.items.projects.map((project: any) =>
          project.id === action.payload.id
            ? { ...project, ...action.payload }
            : project,
        );
        if (state.selectedProject.id === action.payload.id) {
          state.selectedProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchProjectDocumentsByProjectId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedDocuments = action.payload;
        
        const activeDoc = action.payload.find((doc: any) => doc.isActive);
        //Aditya - Making the first tab active, when we have documents in the list but none is selecteed - edge case
        
        if (activeDoc) {
          state.activeDocument = activeDoc;
        } else if (action.payload.length > 0) {
          state.selectedDocuments[0].isActive = true;
          state.activeDocument = state.selectedDocuments[0];
        } else {
          state.activeDocument = {};
        }
      })
      .addCase(fetchProjectDocumentsByProjectId.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to fetch project documents";
      })
      .addCase(fetchProjectDocumentsByProjectId.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPdf.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPdf.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { id, data } = action.payload;
        const docIndex = state.selectedDocuments.findIndex(
          (doc) => doc.id === Number(id),
        );

        if (docIndex !== -1) {
          state.selectedDocuments[docIndex] = {
            ...state.selectedDocuments[docIndex],
            pdfUrl: data,
          };
        }
      })
      .addCase(fetchPdf.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch pdf";
      })
      .addCase(createProjectWithDocuments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createProjectWithDocuments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.projectId = action.payload.projectId;
      })
      .addCase(deleteTab.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTab.fulfilled, (state, action: PayloadAction<Tab[]>) => {
        const docIndex = state.selectedDocuments.findIndex(
          (doc) => doc.id === action.payload,
        );

        if (docIndex !== -1) {
          if (state.selectedDocuments[docIndex].isActive) {
            if (docIndex < state.selectedDocuments.length - 1) {
              state.selectedDocuments[docIndex + 1].isActive = true;
              state.activeDocument = state.selectedDocuments[docIndex + 1];
            } else if (docIndex > 0) {
              state.selectedDocuments[docIndex - 1].isActive = true;
              state.activeDocument = state.selectedDocuments[docIndex - 1];
            }
          }
          state.selectedDocuments.splice(docIndex, 1);
        }
      })
      .addCase(deleteTab.rejected, (state, action) => {
        state.error =
          action.payload || "An error occurred while deleting the tab";
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(updateDocument.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to sync with backend";
      });
  },
});

export const {
  setSelectedProjectDocuments,
  setActiveDocuments,
  removeSelectedDocument,
  reset,
  setLocalPageLock,
  setProjectDocumentList,
  updateActiveDocumentStatus,
  setSearchState,
} = projectDocumentsSlice.actions;

export default projectDocumentsSlice.reducer;