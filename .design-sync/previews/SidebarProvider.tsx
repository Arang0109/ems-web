import { SidebarProvider, SidebarTrigger } from "ems-web";

/**
 * 사이드바 컨텍스트. `AppSidebar`·`SidebarTrigger` 는 이 안에서만 동작한다 —
 * 앱 셸 최상단에 한 번 두고 그 아래에 사이드바와 본문을 넣는다.
 */
export const WithTrigger = () => (
  <SidebarProvider defaultOpen>
    <div className="flex w-full items-center gap-2 border-b border-rule p-3">
      <SidebarTrigger />
      <span className="text-h3">측정일정</span>
    </div>
  </SidebarProvider>
);

/** 접힌 상태로 시작 — `defaultOpen={false}` */
export const CollapsedByDefault = () => (
  <SidebarProvider defaultOpen={false}>
    <div className="flex w-full items-center gap-2 border-b border-rule p-3">
      <SidebarTrigger />
      <span className="text-body-3 text-muted-ink">사이드바가 접힌 채로 시작한다</span>
    </div>
  </SidebarProvider>
);
