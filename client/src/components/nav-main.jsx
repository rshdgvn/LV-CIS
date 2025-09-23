"use client";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

export function NavMain({ items }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const nav = useNavigate();

  return (
    <SidebarMenu
      className={`flex flex-col gap-10 mt-5 ${
        isCollapsed ? "items-center" : "items-start pl-2"
      }`}
    >
      {items.map((item) => (
        <SidebarMenuItem key={item.title} className="mx-7">
          <SidebarMenuButton
            tooltip={item.title}
            onClick={() => nav(item.url)}
            className="gap-4 py-2 px-3" 
          >
            {item.icon && <item.icon className="w-10 h-10" />}
            {!isCollapsed && (
              <span className="text-base">
                {" "}
                {item.title}
              </span>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
