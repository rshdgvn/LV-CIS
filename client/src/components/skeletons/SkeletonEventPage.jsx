"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonEventCard } from "./SkeletonEventCard";

export function SkeletonEventPage({ filtersCount = 3, cardsCount = 6 }) {
  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 my-8 mx-4">
        <div className="flex flex-row items-center gap-5">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-10 w-64 rounded-md" />
        </div>
        <Skeleton className="h-4 w-96 mt-2 rounded-md" />
      </div>

      <div className="flex flex-wrap items-center gap-3 my-3 ml-5">
        {Array.from({ length: filtersCount }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-lg" />
        ))}
        <Skeleton className="h-8 w-32 rounded-lg ml-2" />
      </div>

      <div className="grid gap-4 mt-6">
        {Array.from({ length: cardsCount }).map((_, i) => (
          <SkeletonEventCard key={i} />
        ))}
      </div>
    </div>
  );
}
