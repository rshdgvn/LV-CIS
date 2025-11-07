"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonEventDetails() {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-white">
      {/* Banner Placeholder */}
      <div className="absolute inset-0 w-full h-[400px] bg-neutral-800">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50 p-2 rounded-md bg-neutral-800/60">
        <Skeleton className="w-5 h-5 rounded-sm" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 pt-72 pb-20 px-6 max-w-6xl mx-auto">
        {/* Top Two Cards (Event Info + Tasks) */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Left – Event Info */}
          <div className="bg-neutral-900/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-neutral-800">
            <div className="flex justify-between items-start mb-6">
              <Skeleton className="h-8 w-2/3 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <div className="flex items-center gap-3 mt-3">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>

          {/* Right – Tasks */}
          <div className="bg-neutral-900/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-neutral-800">
            <div className="flex justify-between mb-5">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b border-neutral-800 pb-2"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Details & Organizer Info */}
        <div className="bg-neutral-900/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-neutral-800 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Event Details */}
            <div className="md:col-span-2 space-y-3">
              <Skeleton className="h-7 w-1/3" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}

              <Skeleton className="h-6 w-1/4 mt-6" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-5/6" />
              ))}
            </div>

            {/* Organizer Info */}
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Photos and Videos */}
          <div className="mt-8">
            <Skeleton className="h-6 w-1/3 mb-5" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
