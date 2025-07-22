import React, { SetStateAction, Dispatch, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Head from "next/head";
import { Building2 } from "lucide-react";
import arrowLeft from "../../../../../public/images/arrowLeft.svg";
import Company from "./Company";
import { CompanyDocument } from "./CompanyDocument";
import { getSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsDocument,
  setCurrentCompany,
  setCompanyList,
  setLoading,
  setError,
} from "@/redux/companies/companiesSlice";
import axios from "axios";
import { CompanyDisclosures, IPODocuments } from "./Enums/document-enums";
import { RootState } from "@/store/store";
import debounce from "lodash/debounce";

type View = "project-name" | "uploads" | "company-disclosures" | "documents" | "ipo-research";

interface Document {
  id: string;
  name: string;
}

interface Company {
  id: string;
  name: string;
  documentCount: number;
  documents: Document[];
}

interface MainContentProps {
  companyName: string;
  activeView: View;
  setActiveView: Dispatch<SetStateAction<View>>;
  setBackButtonText: (text: string) => void;
  globalSearchQuery?: string;
  onClearSearch?: () => void;
  selectedTab: string;
}

const MainContent: React.FC<MainContentProps> = ({
  companyName,
  activeView,
  setActiveView,
  setBackButtonText,
  globalSearchQuery = "",
  onClearSearch,
  selectedTab,
}) => {
  const dispatch = useDispatch();
  const { companyLists, loading } = useSelector((state: RootState) => state.companies);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const currentDocumentType = selectedTab === "company-disclosures"
    ? "company-disclosures"
    : "ipo-research";

  const fetchCompanies = async (isInitialLoad = false) => {
    if (!isInitialLoad) {
      dispatch(setLoading(true));
    }
    const session = await getSession();
    try {
      const token = session?.accessToken;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/companies`,
        {
          params: {
            search: globalSearchQuery,
            documentType:
              selectedTab === "company-disclosures"
                ? [CompanyDisclosures.ANNUAL_REPORT, CompanyDisclosures.QUARTERLY_REPORT]
                : [IPODocuments.DRHP, IPODocuments.FOD],
          },
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );
      if (response.status === 200) {
        dispatch(setCompanyList({
          documentType: currentDocumentType,
          companies: response.data
        }));
        if (isInitialLoad) {
          setInitialLoadDone(true);
        }
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      dispatch(setError("Failed to fetch companies"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Debounced search function
  const debouncedFetchCompanies = useCallback(
    debounce(() => {
      if (globalSearchQuery) {
        fetchCompanies();
      } else if (companyLists[currentDocumentType]?.length === 0) {
        // If search is empty and we have no companies, fetch all
        fetchCompanies();
      }
    }, 300),
    [selectedTab, globalSearchQuery, currentDocumentType]
  );

  // Initial data load
  useEffect(() => {
    if ((activeView === "company-disclosures" || activeView === "ipo-research") && !initialLoadDone) {
      fetchCompanies(true);
    }
  }, [activeView, selectedTab]);

  // Handle search changes
  useEffect(() => {
    if (activeView === "company-disclosures" || activeView === "ipo-research") {
      if (globalSearchQuery === "") {
        // When search is cleared, immediately show all companies
        fetchCompanies();
      } else {
        debouncedFetchCompanies();
      }
    }
    
    return () => {
      debouncedFetchCompanies.cancel();
    };
  }, [globalSearchQuery, activeView, selectedTab]);

  const companies = companyLists[currentDocumentType] || [];

  const handleBackClick = () => {
    dispatch(setIsDocument(false));
    dispatch(setCurrentCompany(null));
    setBackButtonText("");
    setActiveView(selectedTab as View);
  };

  // Only render content for company-disclosures, documents, and ipo-research views
  if (activeView !== "company-disclosures" && activeView !== "documents" && activeView !== "ipo-research") {
    return null;
  }

  return (
    <>
      <Head>
        <title>Bynd</title>
        <meta name="description" content="Bynd fin-tech" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/ByndLogoFavicon.svg" />
      </Head>
      <div className="h-full">
        {(activeView === "company-disclosures" || activeView === "ipo-research") && (
          <div className="h-full space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-[18px] text-[#001742]">
                {activeView === "company-disclosures" ? "All Company disclosures" : "IPO Research Reports"}
              </h3>
            </div>
            <div className="h-full overflow-auto">
              <Company loading={loading} companies={companies} activeView={activeView} />
            </div>
          </div>
        )}

        {(activeView === "documents" || activeView === "ipo-research") && (
          <>
            <div className="p-2 flex items-center justify-start gap-2">
              <Image
                src={arrowLeft}
                alt="arrowLeft"
                className="h-6 w-6 cursor-pointer"
                onClick={handleBackClick}
              />
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {companyName}
              </div>
            </div>

            <CompanyDocument
              companyName={companyName}
              activeView={activeView}
              selectedTab={selectedTab}
              onTypeSelect={(documentType) => setBackButtonText(documentType)}
            />
          </>
        )}
      </div>
    </>
  );
};

export default MainContent;
