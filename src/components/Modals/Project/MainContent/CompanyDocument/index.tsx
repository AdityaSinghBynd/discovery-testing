"use client";

import { useState, useMemo, Dispatch, SetStateAction, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedProjectDocuments } from "@/redux/projectDocuments/projectDocumentsSlice";
import DocumentList from "./documentList";
import { View } from "@/types/common";
import NoDocument from "../../../../../../public/images/noDocument.svg";
import Image from "next/image";

type Document = {
  id: string;
  name: string;
  documentType: string;
};

type DocumentType = {
  name: string;
};

type CompanyDocumentProps = {
  companyName: string;
  activeView: string;
  selectedTab: string | undefined;
  onTypeSelect: (typeName: string) => void;
};

export function CompanyDocument({
  companyName,
  activeView,
  selectedTab,
  onTypeSelect,
}: CompanyDocumentProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const dispatch = useDispatch();

  const documentLists = useSelector(
    (state: any) => state.documents.documentLists,
  );
  const selectedDocs = useSelector(
    (state: any) => state.projectDocuments.selectedDocuments,
  );
  const companyDocuments: Document[] = documentLists[companyName] || [];

  const documentTypes = useMemo<DocumentType[]>(() => {
    const uniqueTypes = new Set(
      companyDocuments.map((doc) => doc.documentType.toUpperCase()),
    );
    return Array.from(uniqueTypes).map((name) => ({ name }));
  }, [companyDocuments]);
  useEffect(() => {
    if (documentTypes.length > 0 && !selectedType) {
      console.log("documentTypes", documentTypes);
      const initialType = documentTypes[0].name;
      setSelectedType(initialType);
      handleTypeSelection(initialType);
    }
  }, [documentTypes]);

  const filteredDocuments = useMemo<Document[]>(() => {
    if (!selectedType) return [];
    return companyDocuments.filter(
      (doc) => doc.documentType.toUpperCase() === selectedType,
    );
  }, [selectedType, companyDocuments]);

  const handleTypeSelection = (typeName: string) => {
    console.log("typeName", typeName);
    setSelectedType(typeName);
    const documentTypeName =
      typeName === "AR"
        ? "Annual Reports"
        : typeName === "FOD"
        ? "Final Offer Documents (FOD)"
        : typeName === "IP"
        ? "Investor Presentation (IP)"
        : typeName === "DRHP"
        ? "Draft Red Herring Prospectus (DRHP)"
        : typeName;
    
    onTypeSelect(documentTypeName);
  };

  const toggleSelectAll = () => {
    const allSelected = filteredDocuments.every((doc) =>
      selectedDocs.some((selectedDoc: any) => selectedDoc.id === doc.id),
    );

    filteredDocuments.forEach((doc) => {
      const isSelected = selectedDocs.some(
        (selectedDoc: any) => selectedDoc.id === doc.id,
      );
      if (allSelected === isSelected) {
        dispatch(setSelectedProjectDocuments({ id: doc.id, name: doc.name }));
      }
    });
  };

  const toggleDocument = (docId: string, docName: string) => {
    dispatch(setSelectedProjectDocuments({ id: docId, name: docName }));
  };

  const renderDocumentTypeButton = (type: DocumentType) => {
    console.log("type", type);
    const isSelected = selectedType === type.name;

    const buttonTitle = type.name === "AR"
      ? "Annual Reports (AR)"
      : type.name === "IP"
      ? "Investor Presentation (IP)"
      : type.name === "FOD"
      ? "Final Offer Documents (FOD)"
      : type.name === "DRHP"
      ? "Draft Red Herring Prospectus (DRHP)"
      : type.name;

    const buttonText = buttonTitle;

    if (!buttonTitle) return null;

    return (
      <button
        key={type.name}
        onClick={() => handleTypeSelection(type.name)}
        className={`text-left w-full px-3 py-2 mb-2 rounded font-medium transition-colors ${
          isSelected
            ? "text-[#004CE6] bg-[#F3F6FF]"
            : "text-[#4e5971] hover:bg-[#F3F6FF] hover:text-[#004CE6]"
        }`}
        title={buttonTitle}
      >
        {buttonText}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="gap-2 h-full w-full flex">
        <div className="flex flex-col h-full gap-4 border-r border-[#EAF0FC] p-2 w-1/3">
          <nav className="h-full">
            {documentTypes.map(renderDocumentTypeButton)}
          </nav>
        </div>

        <div className="w-2/3">
          {filteredDocuments.length > 0 ? (
            <DocumentList
              documents={filteredDocuments}
              selectedDocs={selectedDocs}
              toggleSelectAll={toggleSelectAll}
              toggleDocument={toggleDocument}
              selectedType={selectedType}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-sm text-gray-500 text-center py-2 gap-2">
              <Image src={NoDocument} alt="No Document Selected" />
              No documents available for the selected type
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
