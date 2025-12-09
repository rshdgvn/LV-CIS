"use client";

import * as React from "react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import logo from "../assets/lvcc-logo.png";
import { useNavigate } from "react-router-dom";

export function TeamSwitcher() {
  const { isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const nav = useNavigate();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <SidebarMenuButton
            size="xl"
            onClick={() => nav("/")}
            className="relative data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground my-4 flex flex-col items-center justify-center cursor-pointer"
          >
            <a
              className={`flex items-center font-medium ${
                isCollapsed ? "justify-center" : "gap-4"
              }`}
            >
              <img
                src={logo}
                alt="La Verdad Club"
                className="h-13 w-13 object-contain"
              />
              {!isCollapsed && (
                <span className="truncate text-lg font-medium text-white">
                  LVCIS
                </span>
              )}
            </a>
          </SidebarMenuButton>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
