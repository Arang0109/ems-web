import { Outlet } from 'react-router';
import { SidebarProvider, SidebarTrigger } from "@shared/ui/sidebar";
import { Sidebar } from "./Sidebar";

export const MainLayout = () => {

  return (
    <SidebarProvider className="flex justify-center">
      <Sidebar />
      {/* main */}
      <main className="flex-1 max-w-380 min-h-screen bg-canvas px-7.5 py-10">
        <SidebarTrigger className="md:hidden" />
        <Outlet />
      </main>
    </SidebarProvider>
  );
};
