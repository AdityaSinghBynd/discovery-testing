import React from 'react';
import Image from 'next/image';
import ExcelIcon from '../../../../../public/images/excelIcon.svg';
import { LetterText } from 'lucide-react';

interface ChartCardProps {
  filename?: string;
  onClick: () => void;
  modifyType: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  filename,
  onClick,
  modifyType
}) => {

  return (
    <div className="flex justify-start items-center gap-2 border-1 border-[#EAF0FC] 
    rounded p-1 max-w-max cursor-pointer hover:shadow-custom-blue transition-all 
    duration-200"
      onClick={onClick}
    >
      <div className={`flex h-full items-center gap-2 rounded p-2 ${modifyType === "table" ? "bg-[#ECF7F4]" : "bg-[#F3F6FF]"}`}>
        {modifyType === "table" ? (
          <Image src={ExcelIcon} alt="Excel Icon" width={40} height={40} />
        ) : (
          <LetterText className="w-7 h-7 text-[#4e5971]" />
        )}
      </div>
      <div className="flex flex-col items-start gap-2">
        <h4 className="font-medium text-sm text-[#001742]">
          {filename?.replace(/_/g, ' ') || "Chart Preview"}
        </h4>
        <span className="text-xs text-[#9babc7]">Click to open the component</span>
      </div>
    </div>
  );
};

export default ChartCard; 