import { TextSearch } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  fetchFinancialData,
  fetchFinancialDataFromUrl,
} from "@/redux/FinancialStatements/financialStatements.thunks";
import { useEffect, useMemo } from "react";
import ExcelIcon from "../../../public/images/excelIcon.svg";
import aiIcon from "../../../public/images/Vector.svg";
import alertTriangleSVGIcon from "../../../public/images/alertTriangleSVGIcon.svg";
import { baseUrl } from "@/utils/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DocumentActionsProps {
  onAISummaryOpen: () => void;
  onFinancialOpen: () => void;
}

export default function DocumentActions({
  onAISummaryOpen,
  onFinancialOpen,
}: DocumentActionsProps) {
  const { activeDocument } = useSelector(
    (state: RootState) => state.projectDocuments,
  );
  const { financialData } = useSelector(
    (state: RootState) => state.financialStatements,
  );
  const dispatch: AppDispatch = useDispatch();

  // Memoize derived state to prevent unnecessary recalculations
  const currentFinancialData = useMemo(() => {
    return activeDocument.id ? financialData[activeDocument.id] : null;
  }, [activeDocument.id, financialData]);

  const hasError = currentFinancialData?.error;
  const loading = currentFinancialData?.loading;

  // Determine if financial action is disabled
  const isFinancialActionDisabled = useMemo(() => {
    if (!currentFinancialData) return true;
    if (loading) return true;
    if (hasError || currentFinancialData?.data?.status === "error") return true;
    if (!activeDocument.financialUploaded && !currentFinancialData.data) return true;
    return false;
  }, [currentFinancialData, loading, hasError, activeDocument.financialUploaded]);

  useEffect(() => {
    const fetchData = async () => {
      if (!activeDocument.id) return;

      const documentId = activeDocument.id.toString();
      const existingData = financialData[documentId];

      // Check if we need to fetch data
      const shouldFetch = !existingData || (!existingData.data && !existingData.loading);
      if (!shouldFetch) return;

      try {
        if (!activeDocument.financialUploaded) {
          await dispatch(
            fetchFinancialData({
              pdf_url: activeDocument.url,
              id: documentId,
            })
          ).unwrap();
        } else {
          await dispatch(
            fetchFinancialDataFromUrl({
              blob_url: baseUrl(activeDocument.url),
              id: documentId,
            })
          ).unwrap();
        }
      } catch (error) {
        console.error("Failed to fetch financial data:", error);
      }
    };

    fetchData();
  }, [activeDocument.id, activeDocument.url, activeDocument.financialUploaded, dispatch]);

  const handleFinancialClick = () => {
    if (!isFinancialActionDisabled) {
      onFinancialOpen();
    }
  };

  return (
    <Card className="h-full w-full rounded-[10px] overflow-hidden mx-[10px]">
      <div className="flex h-full flex-col">
        <CardHeader className="flex-none pl-0 pr-2 py-2 flex flex-row items-center justify-between w-full rounded-t-[10px]">
          <CardTitle className="text-[20px] font-medium text-[#001742] m-0 flex gap-2 items-center">
            {/* <TextSearch className="h-5 w-5 text-[#001742]" /> */}
            Document Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pl-0 pr-2 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              className={`rounded-[10px] border-1 border-[#eaf0fc] p-2 transition-colors ${isFinancialActionDisabled
                  ? "opacity-50 bg-white cursor-not-allowed"
                  : "cursor-pointer bg-white hover:bg-[#21A2651A] hover:shadow-custom-blue"
                } flex`}
            >
              <div
                className="flex items-center justify-between space-x-2 w-full"
                onClick={handleFinancialClick}
                role="button"
                tabIndex={isFinancialActionDisabled ? -1 : 0}
              >
                <div className="flex flex-row items-center gap-2 w-full h-full">
                  <div className="flex h-full w-14 items-center justify-center bg-[#21A2651A] rounded">
                    <Image src={ExcelIcon} alt="Excel Icon" className="h-8 w-8" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-medium leading-none text-[18px]">
                      Download Financials
                    </h3>
                    <p className="text-sm text-[#4E5971] font-normal">
                      Get all financials tables in a single excel file with formulas
                    </p>
                  </div>
                </div>
                {loading && (
                  <div className="flex items-center justify-center pr-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                  </div>
                )}
                {(hasError || currentFinancialData?.data?.status === "error") && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-center pr-4">
                          <Image
                            src={alertTriangleSVGIcon}
                            alt="Alert Triangle SVG Icon"
                            className="h-5 w-5"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white text-[#001742] shadow-custom-blue rounded border-1 border-[#EAF0FC]">
                        <p>Unable to process the document.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            <div
              className="cursor-pointer rounded-[10px] border-1 border-[#eaf0fc] h-[76px] p-2 transition-colors bg-white hover:bg-[#004CE60D] hover:shadow-custom-blue flex"
              onClick={onAISummaryOpen}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center justify-start space-x-2 w-full">
                <div className="flex h-full w-14 items-center justify-center bg-[#004CE60D] rounded">
                  <Image src={aiIcon} alt="AI Icon" className="h-8 w-8" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="font-medium leading-none text-[18px]">
                    AI Summary
                  </h3>
                  <p className="text-sm text-[#4E5971] font-normal">
                    Interactive AI summary categorised by document topics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}