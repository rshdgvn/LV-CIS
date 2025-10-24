"use client";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";

export function NavMain({ items }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const nav = useNavigate();
  const location = useLocation();

  return (
    <SidebarMenu
      className={`flex flex-col gap-3 mt-5 items-center pl-2`}
    >
      {items.map((item) => {
        const isActive = location.pathname === item.url;

        return (
          <SidebarMenuItem key={item.title} className="w-full pr-2">
            <SidebarMenuButton
              tooltip={item.title}
              onClick={() => nav(item.url)}
              className={`gap-4 px-4 py-5 w-full rounded-sm transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-700 text-white font-medium"
                    : "text-gray-300"
                }`}
            >
              {item.icon && (
                <item.icon
                  className={`w-5 h-5 ${
                    isActive ? "text-white" : "text-gray-300"
                  }`}
                />
              )}
              {!isCollapsed && (
                <span className="text-base font-normal">{item.title}</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
