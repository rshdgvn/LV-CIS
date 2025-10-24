"use client";
import * as React from "react";
import {
  UserRoundCheck,
  GraduationCap,
  CalendarCheck,
  House,
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
import { useAuth } from "@/contexts/AuthContext";

export function AppSidebar({ ...props }) {
  const { user } = useAuth();
  const admin = user?.role == "admin";
  const data = {
    navMain: [
      {
        title: admin ? "Admin" : "Dashboard",
        url: admin ? "/admin/dashboard" : "/dashboard",
        icon: House,
        isActive: true,
      },
      {
        title: "Clubs",
        url: "/clubs",
        icon: GraduationCap,
      },
      {
        title: "Attendance",
        url: "/attendance",
        icon: UserRoundCheck,
      },

      {
        title: "Events",
        url: "/events",
        icon: CalendarCheck,
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
