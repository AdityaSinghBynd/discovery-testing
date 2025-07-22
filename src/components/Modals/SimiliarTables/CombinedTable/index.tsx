"use client";

import React from 'react'
// Redux
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
// Components
import HTMLToShadcnTable from '@/components/Html/Table';
import { Loader2 } from 'lucide-react';
import { useExcelDownload } from '@/hooks/Toolbar/useExcelDownload';
import { useToast } from '@/hooks/use-toast';

const CombinedTable = () => {
  const { downloadExcel } = useExcelDownload();
  const { toast } = useToast();
  // Redux Selectors
  const { previewData, tableId, activeDocument } = useSelector((state: RootState) => ({
    previewData: state.similarTables.previewData,
    tableId: state.similarTables.tableId,
    activeDocument: state.projectDocuments.activeDocument
  }));

  const handleExport = () => {
    if (!previewData[tableId][activeDocument.documentType][activeDocument.year][tableId].data.merged_table.html) {
      toast({
        title: "No preview data available for export",
        description: "Please try again",
        variant: "destructive",
      });
      return;
    }
    try {
      toast({
        title: "Exporting data",
        description: "Please wait",
        variant: "default",
      });
      downloadExcel(previewData[tableId][activeDocument.documentType][activeDocument.year][tableId].data.merged_table.html, "combined_tables");
      toast({
        title: "Data exported successfully",
        description: "Please check your downloads",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error exporting data",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Get preview data for current table - navigate through the nested structure
  const getPreviewData = () => {
    if (!tableId || !activeDocument) return null;

    const tablePreviewData = previewData[tableId];
    if (!tablePreviewData) return null;

    const documentType = activeDocument.documentType;
    const year = activeDocument.year;

    const yearData = tablePreviewData[documentType]?.[year];
    if (!yearData) return null;

    // Get the first available preview data item
    const firstTableId = Object.keys(yearData)[0];
    return firstTableId ? yearData[firstTableId] : null;
  };

  const currentPreviewData = getPreviewData();
  const isLoading = currentPreviewData?.loading || false;
  const error = currentPreviewData?.error || null;
  const data = currentPreviewData?.data || null;

  // Use preview data if available, otherwise fallback to mock data
  const tableContent = data?.merged_table?.html;

  return (
    <div className='w-full h-full flex flex-col'>
      <main className='flex-1 overflow-auto scrollbar-hide'>
        <div className="flex flex-col items-start px-3 py-2 w-full bg-white gap-4">

          {/* Loading State */}
          {isLoading && (
            <div className="w-full h-[70vh] flex items-center justify-center gap-2 py-8">
              <div className="h-full w-full flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-[#004CE6]" />
                <span className="text-lg text-gray-600">Combining selected tables</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="w-full p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">Error combining tables: {error}</p>
            </div>
          )}

          {/* HTML Table */}
          {!isLoading && !error && (
            <div className='w-full bg-white border border-[#eaf0fc] rounded-md'>
              <HTMLToShadcnTable htmlContent={tableContent} />
            </div>
          )}

        </div>
      </main>

      <footer className='w-full px-3 py-2 bg-[#FAFCFF] border-t border-[#DEE6F5] flex items-center justify-end flex-shrink-0'>
        <button
          onClick={handleExport}
          className='px-4 py-2 bg-[#017736] text-white rounded-md hover:bg-[#015e2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={isLoading || !!error}
        >
          Export in Excel
        </button>
      </footer>
    </div>
  )
}

export default CombinedTable