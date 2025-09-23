"use client";
import * as React from "react";
import {
  BookOpen,
  Bot,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Attendance",
      url: "#",
      icon: Bot,
      
    },
    {
      title: "Clubs",
      url: "#",
      icon: BookOpen,
    
    },
    {
      title: "Events",
      url: "#",
      icon: Settings2,
    },
  ],
};
export function AppSidebar({ ...props }) {
  return (
    <Sidebar
      collapsible="icon"
      className="w-55 group-data-[state=collapsed]:w-25 transition-all duration-300"
      {...props}
    >
      <SidebarHeader className="flex">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
