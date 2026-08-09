import { Outlet } from 'react-router';
import { SidebarMobileBar, SidebarProvider } from "@shared/ui/sidebar";
import { APP_BRAND } from "./brand";
import { Sidebar } from "./Sidebar";

export const MainLayout = () => {

  return (
    <SidebarProvider className="flex justify-center">
      <Sidebar />
      {/* main */}
      {/* min-w-0 : flex item 의 min-width:auto 를 풀어 콘텐츠 min-content 가 뷰포트를 밀어내지 않게 한다 */}
      <main className="min-w-0 flex-1 max-w-380 min-h-screen bg-canvas">
        {/* 모바일 상단 바 — 브랜드 로고 + 더보기(⋯)로 사이드바 열기 */}
        <SidebarMobileBar brand={APP_BRAND} />
        {/* 모바일 좌우 여백은 피그마 MO 시안 기준 16px */}
        <div className="px-4 py-6 md:px-7.5 md:py-10">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};
