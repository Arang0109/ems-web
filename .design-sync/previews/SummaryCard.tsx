import { CalendarClock, CircleAlert, FileCheck2, FlaskConical } from "lucide-react";
import { SummaryCard } from "ems-web";

/** 대시보드 요약 카드 한 장 — 수치 + 라벨 + 단위 + 아이콘 */
export const Single = () => (
  <div className="max-w-64">
    <SummaryCard count={128} label="이번 달 측정일정" unit="건" icon={CalendarClock} />
  </div>
);

/** 여러 장을 나란히 — 직접 배치할 때. 그룹 셸이 필요하면 `SummaryCardGroup` 을 쓴다 */
export const Row = () => (
  <div className="grid grid-cols-2 gap-3">
    <SummaryCard count={128} label="측정일정" unit="건" icon={CalendarClock} />
    <SummaryCard count={42} label="분석 대기" unit="건" icon={FlaskConical} />
    <SummaryCard count={96} label="성적서 발행" unit="건" icon={FileCheck2} />
    <SummaryCard count={3} label="기한 초과" unit="건" icon={CircleAlert} />
  </div>
);

/** 0건·큰 수 — 자릿수가 늘어도 레이아웃이 무너지지 않는다 */
export const Extremes = () => (
  <div className="grid grid-cols-2 gap-3">
    <SummaryCard count={0} label="기한 초과" unit="건" icon={CircleAlert} />
    <SummaryCard count={12480} label="누적 측정항목" unit="개" icon={FlaskConical} />
  </div>
);
