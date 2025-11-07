"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonAttendances() {
  return (
    <div className="p-6 text-neutral-200 flex flex-col gap-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64 rounded-md" />

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-neutral-900 rounded-full px-4 py-2 border border-neutral-800 w-[260px]">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>

          {/* Filter Button */}
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-3 bg-[#1a1a1a] py-3 px-6 border-b border-neutral-800">
          {["Event", "Club", "Date"].map((header, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-neutral-800">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-3 py-4 px-6 hover:bg-neutral-800/20 transition"
            >
              <div className="flex justify-start">
                <Skeleton className="h-4 w-40 rounded-md" />
              </div>
              <div className="flex justify-start">
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-sm" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
