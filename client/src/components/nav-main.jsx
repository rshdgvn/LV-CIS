"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";

export function NavMain({ items }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarMenu className="flex flex-col gap-3 mt-5 pl-2">
      {items.map(({ title, url, icon: Icon }) => {
        const isActive = location.pathname === url;

        return (
          <SidebarMenuItem key={title} className="w-full pr-2">
            <SidebarMenuButton
              tooltip={title}
              onClick={() => navigate(url)}
              className={`group flex items-center gap-4 w-full rounded-md px-4 py-7 cursor-pointer transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-700 text-white font-medium hover:bg-blue-700/90"
                    : "text-gray-300 hover:text-white hover:bg-blue-800/20"
                }`}
            >
              {Icon && (
                <Icon
                  className={`w-10 h-10 transition-colors flex-shrink-0 ${
                    isActive
                      ? "text-white"
                      : "text-gray-300 group-hover:text-white"
                  }`}
                />
              )}
              <span className="font-normal text-lg">{title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
