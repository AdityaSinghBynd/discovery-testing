import React from "react";

const SkeletonLoader = () => {
  return (
    <div className="space-y-6 w-full">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="w-full bg-white rounded-lg p-4 animate-pulse"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>

          <div className="w-full h-36 bg-gray-200 rounded mb-4"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
