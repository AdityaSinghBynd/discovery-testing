import React, { useState } from "react";
import { Folder } from "lucide-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setCompanyDocuments } from "@/redux/document/documentSlice";
import { BASE_URL } from "@/constant/constant";

interface Document {
  id: string;
  name: string;
}

interface CompanyDocumentProps {
  companyName: string;
  documents?: Document[];
  onDocumentsFetched: (documents: any[]) => void;
}

export default function CompanyDocumentComponent({
  companyName,
  onDocumentsFetched,
}: CompanyDocumentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const session = await getSession();
      const response = await axios.post(
        `${BASE_URL}/documents/company_name`,
        { companyName },
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (response.status === 201) {
        dispatch(
          setCompanyDocuments({
            companyName: companyName,
            documents: response.data,
          }),
        );
        onDocumentsFetched(response.data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="hover:bg-white rounded" onClick={handleClick}>
      <header className="flex items-center px-2 py-2 cursor-pointer border-1 border-[#eaf0fc] rounded-[6px]">
        <h2 className="text-sm font-medium text-gray-900 flex-grow">
          {companyName}
        </h2>
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        )}
      </header>
    </section>
  );
}
