import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Panel } from "./Panel";
import { SummaryCard } from "./SummaryCard";

export interface SummaryCardItem {
  /** React key. 보통 지표 필드명을 그대로 쓴다 */
  id: string;
  label: string;
  unit: string;
  count: number;
  icon: LucideIcon;
}

interface Props {
  /** 그룹 제목. 없으면 바깥 패널 없이 그리드만 렌더한다 */
  title?: string;
  items: SummaryCardItem[];
  /**
   * 그리드 클래스. 열 수·브레이크포인트·간격이 호출부마다 달라 문자열로 받는다.
   * Tailwind 는 소스에 리터럴로 나타난 클래스만 생성하므로 `sm:grid-cols-${n}` 같은
   * 동적 조립은 불가능하다 — 호출부가 리터럴을 넘긴다.
   */
  gridClassName?: string;
  className?: string;
}

const DEFAULT_GRID = "grid grid-cols-1 gap-3 sm:grid-cols-2";

/** 제목 + 지표 카드 그리드. 제목을 주면 surface 패널로 감싼다. */
export const SummaryCardGroup = ({ title, items, gridClassName, className }: Props) => {
  const cards = items.map(({ id, ...card }) => <SummaryCard key={id} {...card} />);

  // cn 병합이 아닌 치환 — tailwind-merge 는 `sm:grid-cols-2` 와 `lg:grid-cols-4` 를
  // 다른 variant 라 충돌로 보지 않아 둘 다 남기고, 중간 브레이크포인트에서 열 수가 틀어진다.
  const grid = gridClassName ?? DEFAULT_GRID;

  if (!title) return <div className={cn(grid, className)}>{cards}</div>;

  return (
    <Panel className={cn("p-4 space-y-2 shadow-panel ring-1 ring-rule", className)}>
      <p className="text-body-1 text-ink-soft">{title}</p>
      <div className={grid}>{cards}</div>
    </Panel>
  );
};
