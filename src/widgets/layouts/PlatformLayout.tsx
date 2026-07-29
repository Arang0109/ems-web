import { Outlet } from 'react-router';
import { SidebarProvider, SidebarTrigger } from "@shared/ui/sidebar";
import { PlatformSidebar } from "./PlatformSidebar";

export const PlatformLayout = () => {

  return (
    <SidebarProvider>
      <PlatformSidebar />
      {/* main */}
      <main className="flex-1 min-h-screen bg-muted/40">
        <SidebarTrigger className="md:hidden" />
        <Outlet />
      </main>
    </SidebarProvider>
  );
};
