import { BackButton, PageTitle } from "ems-web";

/**
 * 뒤로가기 버튼. 동작 우선순위는 `onClick` > `to` > 히스토리(-1).
 * URL 로 직접 진입할 수 있는 화면은 히스토리가 비어 있으므로 `to` 를 넘긴다.
 */
export const InPageHeader = () => (
  <div className="flex items-center gap-2">
    <BackButton to="/schedule" />
    <PageTitle title="측정일정 상세" />
  </div>
);

/** 단독 — 히스토리 뒤로(-1) */
export const Standalone = () => (
  <div className="flex items-center gap-4">
    <BackButton />
    <span className="text-body-3 text-muted-ink">경로 없이 쓰면 히스토리 뒤로 이동한다</span>
  </div>
);
