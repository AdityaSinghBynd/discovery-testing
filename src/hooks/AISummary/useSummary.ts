import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { Document } from "@/interface/components/AISummary.interface";
import { ApiService } from "@/services/service";

export const useSummary = (documentId: number) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const session = await getSession();
        const response = await ApiService.apiCall(
          "get",
          `/documents/ai-summary/${documentId}`,
          {},
          session?.accessToken,
        );
        setDocuments(response?.data?.documents || []);
      } catch (error) {
        setError(error as Error);
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [documentId]);

  return { documents, isLoading, error };
};
