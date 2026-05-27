import { Outlet } from 'react-router';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Sidebar } from "./Sidebar";

export const MainLayout = () => {

  return (
    <SidebarProvider>
      <Sidebar />
      {/* main */}
      <main className="flex-1 min-h-screen bg-gray-50">
        <SidebarTrigger className="md:hidden" />
        <Outlet />
      </main>
    </SidebarProvider>
  );
};
