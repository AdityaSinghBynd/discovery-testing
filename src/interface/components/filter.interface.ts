export interface SectionData {
  name: string;
  subsections: string[];
}

export type ElementSectionNameProp = string[] | SectionData[];
export type FilterContainerState = "closed" | "closing" | "opening" | "open";

export interface FilterComponentProps {
  documentName?: string;
  elementSectionName: ElementSectionNameProp;
  page: "discovery" | "workspace";
  sections: any;
}
