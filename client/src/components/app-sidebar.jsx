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
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
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
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Attendance",
      url: "/attendance",
      icon: Bot,
    },
    {
      title: "Clubs",
      url: "/clubs",
      icon: BookOpen,
    },
    {
      title: "Events",
      url: "/events",
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
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
