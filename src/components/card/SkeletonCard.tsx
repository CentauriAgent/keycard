import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonCard() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0A0A0F]">
      <div className="mx-auto max-w-[480px] min-h-screen bg-white dark:bg-[#0A0A0F] sm:my-8 sm:min-h-0 sm:rounded-2xl sm:shadow-2xl sm:overflow-hidden">
        {/* Banner skeleton */}
        <Skeleton className="h-[200px] w-full rounded-none" />

        {/* Avatar skeleton */}
        <div className="relative z-10 mx-auto -mt-12 w-24 h-24">
          <Skeleton className="w-24 h-24 rounded-full" />
        </div>

        {/* Name + title */}
        <div className="flex flex-col items-center gap-2 px-4 pt-3 pb-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-5 w-56" />
        </div>

        {/* Quick actions */}
        <div className="flex justify-center gap-3 px-4 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>

        {/* Section skeletons */}
        <div className="px-4 mt-6 space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>

        {/* Bottom padding for toolbar */}
        <div className="pb-24" />
      </div>
    </div>
  );
}
