import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SkeletonSidebar } from "../skeletons/SkeletonSidebar";
import { AppSidebar } from "@/components/app-sidebar";
import logo from "../../assets/lvcc-logo.png";

export default function Layout({ children }) {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "8rem",
      }}
    >
      <AppSidebar />

      <div
        className="fixed flex top-0 left-0 right-0 h-20 bg-neutral-900 border-b border-neutral-800 
             items-center justify-between z-[60] md:invisible"
      >
        <a
          href="/"
          className="flex items-center font-medium justify-center mx-6 gap-4"
        >
          <img
            src={logo}
            alt="La Verdad Club"
            className="object-contain h-12 w-12 ml-14"
          />
          <span className="truncate text-lg font-semibold tracking-wide text-white">
            LVCIS
          </span>
        </a>

        <SidebarTrigger className="mx-3 relative z-[70]" />
      </div>

      <main className="flex-1 m-4 pt-16 md:pt-0">{children}</main>
    </SidebarProvider>
  );
}
