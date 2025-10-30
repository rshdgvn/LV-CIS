import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonEventCard() {
  return (
    <div
      className="
        flex flex-col md:flex-row 
        bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden 
        shadow-[0_4px_20px_rgba(0,0,0,0.3)]
        animate-pulse
      "
    >
      <div className="md:w-1/4 w-full h-48 md:h-auto bg-neutral-800">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      <div className="flex flex-col justify-center p-5 text-white md:w-2/3 space-y-3">
        <Skeleton className="h-5 w-32 rounded-full" />

        <Skeleton className="h-6 w-3/4 rounded-md" />

        <div className="space-y-2">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-5/6 rounded-md" />
          <Skeleton className="h-3 w-4/6 rounded-md" />
        </div>

        <div className="mt-4 space-y-2">
          <Skeleton className="h-3 w-1/3 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
        </div>
      </div>
    </div>
  );
}
