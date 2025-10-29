import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonClubCard() {
  return (
    <div
      className="
        w-72 rounded-xl overflow-hidden 
        border border-gray-800 
        bg-neutral-900/80 backdrop-blur-sm
        shadow-[0_4px_20px_rgba(0,0,0,0.3)]
        flex flex-col
        animate-pulse
      "
    >
      <div className="relative h-28 bg-neutral-800">
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
      </div>

      <div className="flex flex-col justify-between flex-1 p-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4 rounded-md" /> 
          <Skeleton className="h-3 w-full rounded-md" />  
          <Skeleton className="h-3 w-5/6 rounded-md" /> 
        </div>

        <div className="mt-8 flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
