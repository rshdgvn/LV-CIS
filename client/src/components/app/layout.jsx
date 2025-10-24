import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }) {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "8rem",
      }}
    >
      <AppSidebar />
      <main className="flex-1 p-0 m-0">
        <SidebarTrigger className="mt-4 ml-4 visible" />
        {children}
      </main>
    </SidebarProvider>
  );
}
