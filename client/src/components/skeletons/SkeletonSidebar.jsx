"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

export function SkeletonSidebar(props) {
  return (
    <Sidebar
      className="bg-neutral-900 border-r border-neutral-800 w-48 sm:w-56 md:w-64 p-4 space-y-4"
      {...props}
    >
      <SidebarHeader className="h-20 bg-neutral-900 border-b border-neutral-800 flex items-center justify-center">
        <Skeleton className="h-12 w-32 rounded-md" />
      </SidebarHeader>

      <SidebarContent className="space-y-2 mt-4">
        <Skeleton className="h-6 w-full rounded-md" />
        <Skeleton className="h-6 w-5/6 rounded-md" />
        <Skeleton className="h-6 w-2/3 rounded-md" />
        <Skeleton className="h-6 w-4/5 rounded-md" />
      </SidebarContent>

      <SidebarFooter className="mt-auto">
        <Skeleton className="h-10 w-full rounded-md" />
      </SidebarFooter>
    </Sidebar>
  );
}
