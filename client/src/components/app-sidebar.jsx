"use client";
import { useEffect } from "react";
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
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

export function AppSidebar(props) {
  const { user, getUser, loading } = useAuth(); 

  useEffect(() => {
    if (!user?.id) {
      getUser();
    }
  }, [user?.id, getUser]);
  
  const admin = user?.role === "admin";

  const data = {
    navMain: [
      {
        title: admin ? "Admin Dashboard" : "Dashboard",
        url: admin ? "/admin/dashboard" : "/dashboard",
        icon: House,
        isActive: true,
      },
      { title: "Clubs", url: "/clubs", icon: GraduationCap },
      { title: "Attendance", url: "/attendance", icon: UserRoundCheck },
      { title: "Events", url: "/events", icon: CalendarCheck },
    ],
  };

  return (
    <Sidebar
      className="
        bg-neutral-950 border-r border-neutral-800 transition-all duration-300
        w-48 sm:w-56 md:w-64
      "
      {...props}
    >
      <SidebarHeader className="h-20 bg-neutral-900 border-b border-neutral-800 flex items-center justify-center">
        <TeamSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
