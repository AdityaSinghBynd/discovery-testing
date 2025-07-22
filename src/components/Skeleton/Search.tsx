import React from "react";

interface SearchSkeletonProps {
  type?: 'keyTopics' | 'tables' | 'charts';
}

const ListSkeleton = () => (
  <div className="w-full space-y-8">
    {[...Array(4)].map((_, index) => (
      <div key={index} className="w-full animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-6" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-11/12" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
        </div>
      </div>
    ))}
  </div>
);

const CardSkeleton = () => (
  <div className="grid grid-cols-1 w-full">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="animate-pulse bg-white rounded space-y-2">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-2/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="h-40 bg-gray-200 rounded mb-4" />
      </div>
    ))}
  </div>
);

const SearchSkeleton: React.FC<SearchSkeletonProps> = ({ type = 'keyTopics' }) => {
  return (
    <div className="w-full bg-white px-2 rounded overflow-y-auto scrollbar-hide">
      {type === 'keyTopics' ? <ListSkeleton /> : <CardSkeleton />}
    </div>
  );
};

export default SearchSkeleton;
