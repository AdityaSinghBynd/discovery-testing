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
}

const SecondaryTable: React.FC<SecondaryTableProps> = ({ onTabChange, bestMatchTable, otherMatches }) => {
  const [activeTab, setActiveTab] = useState("best-match");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange?.(value);
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
                  className={`p-1.5 w-full flex items-center justify-between gap-3 font-medium text-left text-sm transition-all shadow-none cursor-pointer hover:text-[#004CE6] ${activeTab === "best-match" ? "text-[#004CE6]" : "text-text-primary"
                    }`}
                >
                  {truncateText(bestMatchTable.title, 32)}
                  <RadioGroup defaultValue="best-match" className='flex items-center justify-center'>
                    <RadioGroupItem
                      value="best-match"
                      className='border border-[#DEE6F5] h-5 w-5 data-[state=checked]:!border-[#004CE6] data-[state=checked]:!bg-[#004CE6] data-[state=checked]:!text-white data-[state=checked]:!opacity-100'
                      disabled={true}
                      checked={activeTab === "best-match"}
                    />
                  </RadioGroup>
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
                    className={`p-1.5 w-full flex items-center justify-between gap-3 font-medium text-left text-sm transition-all shadow-none cursor-pointer hover:text-[#004CE6] ${activeTab === `other-match-${match.table_id}` ? "text-[#004CE6]" : "text-text-primary"
                      }`}
                  >
                    {truncateText(match.title, 32)}
                    <RadioGroup defaultValue="best-match" className='flex items-center justify-center'>
                      <RadioGroupItem
                        value="best-match"
                        className='border border-[#DEE6F5] h-5 w-5 data-[state=checked]:!border-[#004CE6] data-[state=checked]:!bg-[#004CE6] data-[state=checked]:!text-white data-[state=checked]:!opacity-100'
                        disabled={true}
                        checked={activeTab === `other-match-${match.table_id}`}
                      />
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Tab Content */}

        {/* Best Match Table */}
        {activeTab === "best-match" && (
          <div className='w-[70%] px-4 py-3'>
            <div className='max-h-max p-[3px] bg-[#eaf0fc] rounded-md'>
              <div className='w-full max-h-[670px] border-2 !border-[#004CE640] rounded-md shadow-sm overflow-hidden'>

                <header className='w-full bg-white px-3 py-2 flex items-center justify-between rounded-t-md'>
                  <div className='flex flex-col items-start'>
                    <h3 className='text-lg font-medium text-text-primary'>{bestMatchTable.title}</h3>
                    <p className='text-sm text-text-secondary'>Page: {bestMatchTable.page_number}</p>
                  </div>
                </header>

                <main className='w-full max-h-[620px] rounded-b-md overflow-auto scrollbar-hide'>
                  <Image src={bestMatchTable.table_without_caption} alt='primaryTable' className='w-full h-auto' width={600} height={600} />
                </main>
              </div>
            </div>
          </div>
        )}

        {/* Other Matches Tables */}
        {otherMatches.map((match: any) => (
          activeTab === `other-match-${match.table_id}` && (
            <div key={match.table_id} className='w-[70%] px-4 py-3'>
              <div className='max-h-max p-[3px] bg-[#eaf0fc] rounded-md'>
                <div className='w-full max-h-[670px] border-2 !border-[#004CE640] rounded-md shadow-sm overflow-hidden'>

                  <header className='w-full bg-white px-3 py-2 flex items-center justify-between rounded-t-md'>
                    <div className='flex flex-col items-start'>
                      <h3 className='text-lg font-medium text-text-primary'>{match.title}</h3>
                      <p className='text-sm text-text-secondary'>Page: {match.page_number}</p>
                    </div>
                  </header>

                  <main className='w-full max-h-[620px] rounded-b-md overflow-auto scrollbar-hide'>
                    <Image src={match.table_without_caption} alt='primaryTable' className='w-full h-auto' width={600} height={500} />
                  </main>
                </div>
              </div>
            </div>
          )
        ))}

      </div>
    </div>
  )
}

export default SecondaryTable