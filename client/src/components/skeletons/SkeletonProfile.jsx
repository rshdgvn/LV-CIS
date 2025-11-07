"use client";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonProfile() {
  return (
    <div className="min-h-screen text-white px-6 py-10 md:px-20 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-6 w-56 mb-2 rounded-md" />
        <Skeleton className="h-4 w-80 rounded-md" />
      </div>

      {/* Profile Card */}
      <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 mb-10 shadow-lg border border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
          </div>

          <Skeleton className="mt-4 md:mt-0 h-8 w-28 rounded-md" />
        </div>

        {/* Profile Info Fields */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Account Security Card */}
      <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-lg border border-neutral-800">
        <Skeleton className="h-5 w-40 mb-6 rounded-md" />

        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 mb-4">
            <Skeleton className="h-3 w-36 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}

        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
