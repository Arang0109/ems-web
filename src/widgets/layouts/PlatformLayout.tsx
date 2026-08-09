import { Outlet } from 'react-router';
import { SidebarMobileBar, SidebarProvider } from "@shared/ui/sidebar";
import { PLATFORM_BRAND } from "./brand";
import { PlatformSidebar } from "./PlatformSidebar";

export const PlatformLayout = () => {

  return (
    <SidebarProvider>
      <PlatformSidebar />
      {/* main */}
      <main className="flex-1 min-h-screen bg-canvas">
        <SidebarMobileBar brand={PLATFORM_BRAND} />
        {/* 페이지 여백은 레이아웃이 소유한다 — MainLayout 과 동일 규격 */}
        <div className="px-4 py-6 md:px-7.5 md:py-10">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};
