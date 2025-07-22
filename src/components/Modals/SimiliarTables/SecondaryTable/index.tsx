"use client";

import React, { useState } from 'react'
import Image from 'next/image'
// Images
import vectorAISvgIcon from '../../../../../public/images/vectorAISvgIcon.svg'
// Components
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
// Utils
import { truncateText } from '@/utils/utils'

interface SecondaryTableProps {
  onTabChange?: (value: string) => void;
  bestMatchTable: any;
  otherMatches: any;
  isDocumentSelected?: boolean;
  hasSelectedTableFromThisDoc?: boolean;
  selectedTableId?: string | number;
}

const SecondaryTable: React.FC<SecondaryTableProps> = ({
  onTabChange,
  bestMatchTable,
  otherMatches,
  isDocumentSelected = false,
  hasSelectedTableFromThisDoc = false,
  selectedTableId
}) => {
  const [activeTab, setActiveTab] = useState("best-match");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange?.(value);
  };

  // Determine which tab should be active based on selectedTableId
  const getActiveTab = () => {
    if (selectedTableId) {
      if (bestMatchTable.table_id === selectedTableId) {
        return "best-match";
      }
      return `other-match-${selectedTableId}`;
    }
    // If no table is selected, don't show any as active
    return "";
  };

  const currentActiveTab = getActiveTab();

  // Common table content component to avoid duplication and improve performance
  const TableContent = ({ table }: { table: any }) => (
    <div className='w-[70%] px-4 py-3'>
      <div className='max-h-max border-2 border-[#004CE640] rounded-md shadow-sm overflow-hidden bg-white'>
        <header className='w-full bg-white px-3 py-2 flex items-center justify-between rounded-t-md'>
          <div className='flex items-center justify-between w-full gap-2'>
            <h3 className='text-lg font-medium text-text-primary'>{table.title}</h3>
            <p className='text-sm font-medium text-text-secondary'>Page: {table.page_number}</p>
          </div>
        </header>

        <main className='w-full max-h-[620px] rounded-b-md overflow-auto scrollbar-hide bg-white'>
          <Image
            src={table.table_without_caption}
            alt='Table content'
            className='w-full h-auto'
            width={600}
            height={600}
            priority={currentActiveTab === "best-match" || currentActiveTab === `other-match-${table.table_id}`}
          />
        </main>
      </div>
    </div>
  );

  // Content area component that shows either table or message
  const ContentArea = () => {
    if (!isDocumentSelected) {
      return (
        <div className='w-[70%] px-4 py-3'>
          <div className='max-h-max rounded-md  overflow-hidden bg-white'>
            <div className='w-full h-[620px] flex items-center justify-center'>
              <div className="text-center">
                <p className="text-lg font-medium text-text-secondary mb-2">
                  Please select any table to see the content
                </p>
                <p className="text-sm text-text-secondary">
                  Check the checkbox to select tables from this document
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!hasSelectedTableFromThisDoc || !currentActiveTab) {
      return (
        <div className='w-[70%] px-4 py-3'>
          <div className='max-h-max border-2 border-[#004CE640] rounded-md shadow-sm overflow-hidden bg-white'>
            <div className='w-full h-[620px] flex items-center justify-center'>
              <div className="text-center">
                <p className="text-lg font-medium text-text-secondary mb-2">
                  Please select any table to see the content
                </p>
                <p className="text-sm text-text-secondary">
                  Click on any radio button to select a table
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show selected table content
    if (currentActiveTab === "best-match") {
      return <TableContent table={bestMatchTable} />;
    }

    const selectedMatch = otherMatches.find((match: any) =>
      currentActiveTab === `other-match-${match.table_id}`
    );

    if (selectedMatch) {
      return <TableContent table={selectedMatch} />;
    }

    // Fallback - show message if no specific table is selected
    return (
      <div className='w-[70%] px-4 py-3'>
        <div className='max-h-max border-2 border-[#004CE640] rounded-md shadow-sm overflow-hidden bg-white'>
          <div className='w-full h-[620px] flex items-center justify-center'>
            <div className="text-center">
              <p className="text-lg font-medium text-text-secondary mb-2">
                Please select any table to see the content
              </p>
              <p className="text-sm text-text-secondary">
                Click on any radio button to select a table
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full border-r border-[#eaf0fc]">
      <div className="w-full h-full flex items-start justify-start">
        <div className="px-3 py-2 w-[30%] h-full border-r border-[#eaf0fc] flex flex-col items-start justify-start gap-4 overflow-hidden">

          {/* Best Match Section */}
          <div className='w-full flex flex-col items-start justify-start gap-2 bg-transparent'>
            <h2 className="flex items-center gap-2 text-sm font-medium text-text-primary border-b border-[#eaf0fc] pb-2 w-full">
              <Image src={vectorAISvgIcon} alt="AI Analysis" width={12} height={12} />
              Best match
            </h2>
            <div className="w-full">
              <div className="flex flex-col gap-1 bg-transparent p-0 w-full">
                <div
                  onClick={() => handleTabChange("best-match")}
                  className={`p-1.5 w-full flex items-center justify-between gap-3 font-medium text-left text-sm transition-colors duration-150 shadow-none cursor-pointer hover:text-[#004CE6] ${currentActiveTab === "best-match" ? "text-[#004CE6]" : "text-text-primary"
                    }`}
                >
                  {truncateText(bestMatchTable.title, 32)}
                  <div onClick={(e) => e.stopPropagation()}>
                    <RadioGroup value={currentActiveTab || ""} className='flex items-center justify-center'>
                      <RadioGroupItem
                        value="best-match"
                        className='border border-[#DEE6F5] h-5 w-5 data-[state=checked]:!border-[#004CE6] data-[state=checked]:!bg-[#004CE6] data-[state=checked]:!text-white data-[state=checked]:!opacity-100'
                        onClick={() => handleTabChange("best-match")}
                      />
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Matches Section */}
          <div className='w-full flex flex-col items-start justify-start gap-2 bg-transparent'>
            <h2 className="text-sm font-medium text-text-primary border-b border-[#eaf0fc] pb-2 w-full">
              Other matches
            </h2>
            <div className="w-full overflow-y-auto max-h-[600px] scrollbar-hide" >
              <div className="flex flex-col gap-1 bg-transparent p-0 w-full">
                {otherMatches.map((match: any) => (
                  <div
                    key={match.table_id}
                    onClick={() => handleTabChange(`other-match-${match.table_id}`)}
                    className={`p-1.5 w-full flex items-center justify-between gap-3 font-medium text-left text-sm transition-colors duration-150 shadow-none cursor-pointer hover:text-[#004CE6] ${currentActiveTab === `other-match-${match.table_id}` ? "text-[#004CE6]" : "text-text-primary"
                      }`}
                  >
                    {truncateText(match.title, 32)}
                    <div onClick={(e) => e.stopPropagation()}>
                      <RadioGroup value={currentActiveTab || ""} className='flex items-center justify-center'>
                        <RadioGroupItem
                          value={`other-match-${match.table_id}`}
                          className='border border-[#DEE6F5] h-5 w-5 data-[state=checked]:!border-[#004CE6] data-[state=checked]:!bg-[#004CE6] data-[state=checked]:!text-white data-[state=checked]:!opacity-100'
                          onClick={() => handleTabChange(`other-match-${match.table_id}`)}
                        />
                      </RadioGroup>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Content Area */}
        <ContentArea />

      </div>
    </div>
  )
}

export default SecondaryTable