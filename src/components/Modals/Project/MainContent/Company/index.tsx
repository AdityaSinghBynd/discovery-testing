import React from "react";
import { Building2 } from "lucide-react";
import CompanyList from "./companyList";
import { useDispatch } from "react-redux";
import {
  setCurrentCompany,
  setIsDocument,
} from "@/redux/companies/companiesSlice";

interface CompanyProps {
  loading: boolean;
  activeView: string;
  companies: any[];
}

export default function Company({ loading, companies, activeView }: CompanyProps) {
  const dispatch = useDispatch();

  const renderContent = () => {
    if (loading && (!companies || companies.length === 0)) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#004CE6] border-t-transparent shadow-md"/>
        </div>
      );
    }

    if (!loading && (!companies || companies.length === 0)) {
      return (
        <div className="text-center py-8 bg-[#F3F6FF] rounded">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 font-medium">No companies found</p>
          <p className="text-sm text-gray-500">
            Try adjusting your search or browse all companies
          </p>
        </div>
      );
    }

    return companies.map((company: any) => (
      <div key={company.id} className="mt-0">
        <CompanyList
          companyName={company}
          onDocumentsFetched={(documents) => {
            dispatch(setIsDocument(true));
            dispatch(setCurrentCompany(company));
          }}
        />
      </div>
    ));
  };

  return (
    <div className="max-h-screen overflow-y-auto scrollbar-hide flex flex-col">
      <div className="flex-1 pb-[50%]">
        <div className="flex flex-col space-y-2 gap-2">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
