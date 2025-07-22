import { RootState } from "@/store/store";

export const selectWorkspaceHiddenSections = (state: RootState) =>
  state.workspace.hiddenSections;

export const selectWorkspaceTotalHiddenItems = (state: RootState) =>
  state.workspace.hiddenSections.length;

export const selectIsWorkspaceSectionHidden =
  (section: string) => (state: RootState) =>
    state.workspace.hiddenSections.includes(section);
