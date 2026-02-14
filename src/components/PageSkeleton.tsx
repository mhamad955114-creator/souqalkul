import { Skeleton } from "@/components/ui/skeleton";

const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header skeleton */}
      <div className="border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="px-4 py-6 space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-5 w-3/4 mx-auto rounded-lg" />
      </div>

      {/* Categories skeleton */}
      <div className="px-4 py-4">
        <Skeleton className="h-6 w-32 mb-4 rounded-lg" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Listings skeleton */}
      <div className="px-4 py-4">
        <Skeleton className="h-6 w-40 mb-4 rounded-lg" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/40 overflow-hidden">
              <Skeleton className="h-32 w-full" />
              <div className="p-2.5 space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-3 w-2/3 rounded" />
                <Skeleton className="h-5 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
