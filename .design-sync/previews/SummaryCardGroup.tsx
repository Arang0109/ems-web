import { CalendarClock, CircleAlert, FileCheck2, FlaskConical } from "lucide-react";
import { SummaryCardGroup } from "ems-web";

const ITEMS = [
  { id: "scheduled", label: "측정일정", unit: "건", count: 128, icon: CalendarClock },
  { id: "analyzing", label: "분석 대기", unit: "건", count: 42, icon: FlaskConical },
  { id: "issued", label: "성적서 발행", unit: "건", count: 96, icon: FileCheck2 },
  { id: "overdue", label: "기한 초과", unit: "건", count: 3, icon: CircleAlert },
];

/**
 * 제목이 있으면 바깥 패널까지 그린다.
 * `gridClassName` 은 리터럴로 넘긴다 — Tailwind 는 소스에 그대로 나타난 클래스만 만든다.
 */
export const WithTitle = () => (
  <SummaryCardGroup
    title="이번 달 현황"
    items={ITEMS}
    gridClassName="grid grid-cols-1 gap-3 sm:grid-cols-2"
  />
);

/** 제목 없이 — 바깥 패널 없이 그리드만 렌더한다 */
export const GridOnly = () => (
  <SummaryCardGroup items={ITEMS} gridClassName="grid grid-cols-1 gap-3 md:grid-cols-2" />
);

/** 항목이 둘뿐일 때 */
export const TwoItems = () => (
  <SummaryCardGroup
    title="전체 현황"
    items={ITEMS.slice(0, 2)}
    gridClassName="grid grid-cols-1 gap-3 sm:grid-cols-2"
  />
);
