import React from "react";
import { Skeleton } from "../ui/skeleton";
import { getBorderColor } from "@/utils/utils";

const PdfSkeleton: React.FC = () => {
  const sections = Array.from({ length: 4 });
  return (
    <div className="w-full max-w-6xl mx-auto space-y-5 p-2">
      {sections.map((_, index) => (
        <div
          key={index}
          className="bg-[#ffffff] shadow-[0px_4px_8px_0px_rgba(0,76,230,0.05)] border-1 border-[#EAF0FC] rounded p-2"
        >
          <div className="mb-2.5 flex items-center justify-start">
            <div
              className="w-1 h-5 mr-2"
              style={{ backgroundColor: getBorderColor(index) }}
            />
            <Skeleton className="h-5 rounded-[4px] bg-[#eaf0fc] w-[250px]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-full aspect-[3/4] animate-none bg-[#f7f9fe]"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PdfSkeleton;
