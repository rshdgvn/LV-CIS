"use client";
import * as React from "react";
import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";

export function AppSidebar({ ...props }) {
  const { user } = useAuth();
  const admin = user?.role == "admin";
  const data = {
    navMain: [
      {
        title: admin ? "Admin" : "Dashboard",
        url: admin? "/admin/dashboard" : "/dashboard",
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
  return (
    <Sidebar
      collapsible="icon"
      className="w-55 group-data-[state=collapsed]:w-25 transition-all duration-300"
      {...props}
    >
      <SidebarHeader className="flex">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
