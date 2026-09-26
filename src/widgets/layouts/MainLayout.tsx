import { Outlet, useMatches } from 'react-router';

import { cn } from "@/lib/utils";
import { SidebarMobileBar, SidebarProvider } from "@shared/ui/sidebar";
import { APP_BRAND } from "./brand";
import { Sidebar } from "./Sidebar";
import type { MainRouteHandle } from "./route-handle";

export const MainLayout = () => {
  // 화면에 꽉 차야 하는 페이지(채팅)는 라우트 `handle` 로 그렇다고 알린다.
  // 여백과 높이의 주인은 여전히 레이아웃이다 — 페이지가 되돌리지 않는다.
  const handles = useMatches().map((m) => m.handle as MainRouteHandle | undefined);
  const isFill = handles.some((h) => h?.fill);
  const isDetail = handles.some((h) => h?.detail);

  return (
    <SidebarProvider className="flex justify-center">
      <Sidebar />
      {/* main */}
      {/* min-w-0 : flex item 의 min-width:auto 를 풀어 콘텐츠 min-content 가 뷰포트를 밀어내지 않게 한다 */}
      <main
        className={cn(
          "min-w-0 flex-1 max-w-380 bg-canvas",
          // overflow-hidden : 스크롤을 페이지 안쪽(대화 목록·말풍선)에 가둔다.
          // h-dvh 는 모바일 주소창이 접힐 때 100vh 가 넘치는 것을 막는다.
          isFill ? "flex h-dvh flex-col overflow-hidden" : "min-h-dvh",
        )}
      >
        {/* 모바일 상단 바 — 브랜드 로고 + 더보기(⋯)로 사이드바 열기.
            상세 화면은 페이지 헤더가 메뉴 버튼을 대신 노출하므로 숨긴다. */}
        {!isDetail && <SidebarMobileBar brand={APP_BRAND} />}
        {/* 모바일 좌우 여백은 피그마 MO 시안 기준 16px */}
        <div
          className={cn(
            // 꽉 찬 화면은 상하 여백을 줄인다 — 넉넉한 여백은 스크롤되는 페이지의 규격이고,
            // 여기서는 그만큼 대화 영역이 깎인다. min-h-0 이 없으면 flex 자식이 줄지 않는다.
            isFill
              // 아래 여백은 iOS 홈 인디케이터만큼 늘린다 — 입력창이 화면 맨 아래에 붙는 화면이다.
              ? "flex min-h-0 flex-1 flex-col px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-7.5 md:py-6"
              : isDetail
                // 상세 화면은 모바일 상단 여백을 없애 sticky 페이지 헤더가 화면 최상단에 붙게 한다
                ? "px-4 pt-0 pb-6 md:px-7.5 md:py-10"
                : "px-4 py-6 md:px-7.5 md:py-10",
          )}
        >
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};
