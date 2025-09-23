"use client";
import * as React from "react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "../assets/lvcc-logo.png";

export function TeamSwitcher() {
  const { isMobile, state } = useSidebar(); 
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <SidebarMenuButton
            size="xl"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground my-4 flex flex-col items-center justify-center"
          >
            <a
              href="/dashboard"
              className={`flex items-center font-medium ${
                isCollapsed ? "justify-center" : "gap-4"
              }`}
            >
              <img
                src={logo}
                alt="La Verdad Club"
                className={`object-contain ${
                  isCollapsed ? "h-13 w-13" : "h-13 w-13"
                }`}
              />
              {!isCollapsed && (
                <span className="truncate text-lg font-medium">LVCIS</span>
              )}
            </a>
          </SidebarMenuButton>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
