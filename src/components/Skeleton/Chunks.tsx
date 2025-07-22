const ChunkSkeleton = () => (
  <div className="w-full max-w-[1200px] h-full mx-auto pt-3">
    <p>Please wait while we parsing the document</p>
    {[...Array(4)].map((_, sectionIndex) => (
      <div key={sectionIndex} className="mb-3">
        <div
          className="h-[94px] w-full mb-3 rounded 
                     bg-skeleton-gradient bg-[length:800px_104px] 
                     animate-skeleton-wave"
        ></div>
      </div>
    ))}
  </div>
);

export default ChunkSkeleton;
