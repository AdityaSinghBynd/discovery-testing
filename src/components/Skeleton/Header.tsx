import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonHeader() {
  return (
    <>
      <header className="w-full  px-2 py-1 flex items-center justify-between gap-4">
        <div className="flex items-center">
          <Skeleton className="h-5 w-6" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 bg-skeleton-gradient" />
            <Skeleton className="h-4 w-8 bg-skeleton-gradient" />
          </div>
        </div>
        <div className="flex-1 max-w-xl">
          <Skeleton className="h-9 w-full rounded-md bg-skeleton-gradient" />
        </div>
        <div className="flex items-center gap-6">
          <Skeleton className="h-4 w-16 bg-skeleton-gradient" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20 bg-skeleton-gradient" />
            <Skeleton className="h-5 w-5 rounded-full bg-skeleton-gradient" />
          </div>
        </div>
      </header>
    </>
  );
}
