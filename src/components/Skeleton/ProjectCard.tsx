import React from "react";

const CardSkeleton: React.FC = () => {
  return (
    <div className="w-full h-[271px] rounded-[12px] bg-white hover:bg-white transition-shadow border-1 border-[#EAF0FC] flex flex-col justify-between">
      <div className="bg-[#F3F7FF] h-[198px] w-full rounded-t-[12px]"></div>
      <div className="flex flex-col gap-2 px-3 py-2 bg-white rounded-b-[12px]">
        <div className="bg-[#fbfdff] h-[20px] w-2/4 rounded-[4px] bg-skeleton-gradient animate-skeleton-wave"></div>
        <div className="bg-[#fbfdff] h-[18px] w-1/4 rounded-[4px] bg-skeleton-gradient animate-skeleton-wave"></div>
      </div>
    </div>
  );
};

export default CardSkeleton;
