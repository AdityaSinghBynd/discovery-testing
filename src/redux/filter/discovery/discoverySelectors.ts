import { RootState } from "@/store/store";

export const selectDiscoveryHiddenSections = (state: RootState) =>
  state.discovery.hiddenSections;
export const selectDiscoveryHiddenSubsections = (state: RootState) =>
  state.discovery.hiddenSubsections;

export const selectDiscoveryTotalHiddenItems = (state: RootState) => {
  const hiddenSectionsCount = state.discovery.hiddenSections.length;
  const hiddenSubsectionsCount = Object.values(
    state.discovery.hiddenSubsections,
  ).reduce((total, subsections) => total + subsections.length, 0);
  return hiddenSectionsCount + hiddenSubsectionsCount;
};

export const selectIsDiscoverySectionHidden =
  (section: string) => (state: RootState) =>
    state.discovery.hiddenSections.includes(section);

export const selectIsDiscoverySubsectionHidden =
  (section: string, subsection: string) => (state: RootState) =>
    state.discovery.hiddenSubsections[section]?.includes(subsection) ?? false;
