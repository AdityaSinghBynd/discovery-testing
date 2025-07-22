"use client";

import React from 'react'
import Image from 'next/image'
// Images
import DummyPrimaryTableImage from '../../../../../public/images/DummyPrimaryTableImage.png'
// Types
interface PrimaryTableData {
  primaryTableData: any;
  primaryTableImage: string;
}
const PrimaryTable = ({ primaryTableData, primaryTableImage }: PrimaryTableData) => {

  return (
    <div className='max-w-max max-h-max p-[3px] bg-[#eaf0fc] rounded-md'>
    <div className='min-w-[800px] max-w-[800px] max-h-max border-2 !border-[#004CE640] rounded-md shadow-sm overflow-hidden'>

      <header className='w-full bg-white px-3 py-2 flex items-center justify-between rounded-t-md'>
        <div className='flex items-center justify-between w-full gap-2'>
          <h3 className='text-lg font-medium text-text-primary'>{primaryTableData.title}</h3>
          <p className='text-md font-medium text-text-secondary'>Page: {primaryTableData.page_number}</p>
        </div>
      </header>

      <main className='w-full max-h-[620px] rounded-b-md overflow-y-auto scrollbar-hide'>
        <Image src={primaryTableImage || DummyPrimaryTableImage} alt='primaryTable' className='w-full h-auto' width={600} height={600} />
      </main>
    </div>
    </div>
  )
}

export default PrimaryTable