import React from "react";

const AISummary: React.FC = () => {
  return (
    <div className="w-full h-full ml-[8px] mt-[16px]">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="w-full rounded-lg animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-skeleton-gradient rounded w-1/3"></div>
          </div>

          <div className="space-y-2 mb-4 pl-[10px]">
            <div className="h-4 bg-skeleton-gradient rounded w-full"></div>
            <div className="h-4 bg-skeleton-gradient rounded w-5/6"></div>
            <div className="h-4 bg-skeleton-gradient rounded w-full"></div>
            <div className="h-4 bg-skeleton-gradient rounded w-full"></div>
            <div className="h-4 bg-skeleton-gradient rounded w-5/6"></div>
            <div className="h-4 bg-skeleton-gradient rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AISummary;
