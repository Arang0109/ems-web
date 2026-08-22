import React from "react";

import { cn } from "@/lib/utils";
import { HelpTip } from "@shared/ui/tooltip";

export interface CalcResultItem {
  label: React.ReactNode;
  /** 계산 전이거나 값이 없으면 `null`·`undefined`·`''` 를 그대로 넘긴다 */
  value: number | string | null | undefined;
  unit?: React.ReactNode;
  /** 라벨 옆 도움말 — 계산식처럼 상시 노출하기엔 긴 안내 */
  hint?: React.ReactNode;
  /** 도움말 아이콘의 접근성 이름. 라벨이 문자열이 아닐 때 지정한다 */
  hintLabel?: string;
}

// md 이상의 열 수. 모바일은 항상 2열이다 (라벨이 길어 1열은 공간 낭비, 3열은 잘린다).
const COLUMN_CLASS = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
} as const;

interface Props {
  items: CalcResultItem[];
  /** md 이상에서의 열 수. 기본 3 */
  columns?: keyof typeof COLUMN_CLASS;
  /** 묶음 제목 — 없으면 렌더하지 않는다 */
  title?: React.ReactNode;
  /**
   * 값이 하나도 없을 때 자리를 차지하는 대신 보여줄 한 줄 안내.
   * 지정하지 않으면 빈 값(`—`)들을 그대로 렌더한다.
   */
  emptyText?: React.ReactNode;
  className?: string;
}

const isBlank = (value: CalcResultItem["value"]): boolean =>
  value == null || (typeof value === "string" && value.trim() === "");

/**
 * 자동계산 결과 묶음 — 라벨 위, 값 아래.
 *
 * **읽기 전용 값에 입력창 프레임을 씌우지 않기 위한 컴포넌트다.** `readOnly` 입력은
 * 포커스가 잡혀 탭 순회에 걸리고, 테두리 때문에 고칠 수 있는 값으로 읽히며,
 * 프레임 높이(48px) 때문에 폼이 불필요하게 길어진다. 여기서는 값이 주인공이라
 * 값을 18px 로 키우고 라벨을 12px muted 로 낮춘다.
 *
 * 역할 구분:
 * - `CalcResultRow` — 입력 필드의 `helper` 슬롯에 딸리는 **파생값 한 줄**
 * - `CalcResultGrid` — 입력과 독립된 **결과 묶음 N개**
 */
export const CalcResultGrid = ({
  items,
  columns = 3,
  title,
  emptyText,
  className,
}: Props) => {
  const isEmpty = items.every((item) => isBlank(item.value));

  return (
    <div className={cn("rounded-nav bg-canvas p-3", className)}>
      {title && <p className="mb-2 text-label text-muted-ink">{title}</p>}

      {isEmpty && emptyText ? (
        <p className="text-body-3 text-muted-ink">{emptyText}</p>
      ) : (
        <dl className={cn("grid gap-x-4 gap-y-3", COLUMN_CLASS[columns])}>
          {items.map((item, index) => (
            <div key={index} className="min-w-0">
              <dt className="flex min-w-0 items-center gap-0.5 text-label text-muted-ink">
                <span className="truncate">{item.label}</span>
                {item.hint && (
                  <HelpTip
                    content={item.hint}
                    label={
                      item.hintLabel ??
                      (typeof item.label === "string" ? `${item.label} 설명` : "항목 설명")
                    }
                  />
                )}
              </dt>
              <dd className="mt-0.5 flex min-w-0 items-baseline gap-1">
                <span className="truncate text-h3 text-ink">
                  {isBlank(item.value) ? "—" : item.value}
                </span>
                {item.unit && <span className="shrink-0 text-body-3 text-ink-soft">{item.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};
