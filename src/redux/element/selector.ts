import { createSelector } from "reselect";
import { RootState } from "@/store/store";

export const selectElementsById = (state: RootState) =>
  state.elements.elementsByWorkspaceId;

export const selectElementById = (id: string) =>
  createSelector(
    selectElementsById,
    (elementsByWorkspaceId) => elementsByWorkspaceId[id],
  );

export const hasNextPage = (state: RootState) => state.elements.hasNextPage;

export const selectAllElements = createSelector(
  selectElementsById,
  (elementsByWorkspaceId) => Object.values(elementsByWorkspaceId),
);
