"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonClubDetails() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900">
          <div className="flex items-start gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-6 w-40 rounded-md" />
              <Skeleton className="h-4 w-96 rounded-md" />
              <Skeleton className="h-4 w-80 rounded-md" />
              <div className="mt-2">
                <Skeleton className="h-4 w-24 rounded-md mb-1" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-24 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 rounded-xl border border-neutral-800 bg-neutral-950"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-40 mb-1 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-3 mt-5">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900">
        <div className="flex justify-between items-center mb-3">
          <Skeleton className="h-6 w-32 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
