"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonAttendanceDetails() {
  return (
    <div className="p-6 bg-neutral-950 text-white flex flex-col gap-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-9 h-9 rounded-md" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-64 rounded-md" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 mx-4 lg:mx-20">
        {/* Table Section */}
        <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-3 py-3 px-6 border-b border-neutral-800 bg-[#1a1a1a]">
            {["Students", "Course", "Status"].map((_, i) => (
              <Skeleton key={i} className="h-4 w-20 mx-auto rounded-md" />
            ))}
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-neutral-800">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-3 items-center py-4 px-6 hover:bg-neutral-800/20 transition"
              >
                {/* Student Name */}
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 w-40 rounded-md" />
                </div>

                {/* Course */}
                <div className="flex justify-center">
                  <Skeleton className="h-4 w-32 rounded-md" />
                </div>

                {/* Status Dropdown */}
                <div className="flex justify-center">
                  <Skeleton className="h-8 w-28 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Cards (Right Side) */}
        <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-[260px] mt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#111111] border-none rounded-2xl shadow-sm p-3 flex flex-row items-center gap-3 h-24"
            >
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-40 rounded-md" />
                <Skeleton className="h-6 w-12 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
