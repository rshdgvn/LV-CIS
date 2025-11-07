"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonEventTasksTable() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 flex flex-col">
      {/* Back Button */}
      <button className="absolute top-4 left-4 z-50 p-2 rounded-md bg-neutral-800/60">
        <Skeleton className="w-5 h-5 rounded-sm" />
      </button>

      {/* Title + Description */}
      <div className="flex flex-col mb-10 ml-14 gap-3 mt-2">
        <Skeleton className="h-9 w-64 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      {/* Search + Filter Bar */}
      <div className="flex items-center gap-3 mb-6 w-5/6 self-center">
        <div className="flex items-center gap-2 bg-[#121212] rounded-full px-4 py-2 w-full border border-neutral-800">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="h-4 w-1/3" />
        </div>

        <Skeleton className="h-9 w-28 rounded-full" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl w-5/6 bg-[#121212] border border-neutral-800 self-center shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#1a1a1a] grid grid-cols-4 py-4 px-6 border-b border-neutral-800">
          {["Tasks", "Assigned", "Due Date", "Status"].map((header, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>

        {/* Table Body */}
        <div className="divide-y divide-neutral-800">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-4 py-4 px-6 hover:bg-neutral-800/20 transition"
            >
              <div className="flex justify-center">
                <Skeleton className="h-4 w-28 rounded-md" />
              </div>
              <div className="flex justify-center">
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
              <div className="flex justify-center">
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>
              <div className="flex justify-center">
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
