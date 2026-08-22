import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@shared/ui/badges";

export interface StepNavItem {
  id: string;
  label: string;
  /** 남은 필수 입력 배지 — total 0 이면 표시하지 않는다 */
  progress?: { done: number; total: number };
}

interface Props {
  items: StepNavItem[];
  activeId: string;
  /** 없으면 표시 전용(버튼이 아니라 텍스트)으로 렌더한다 */
  onSelect?: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

/**
 * 스텝 위저드의 진행 인디케이터.
 *
 * `ChipNav` 와 달리 **순서**가 의미를 가진다 — 번호 원, 연결선, 완료/현재/미방문 3상태.
 * 색만으로 상태를 구분하지 않도록 완료는 체크 아이콘, 미방문은 번호를 함께 보여준다.
 *
 * md 미만에서는 라벨을 감추고(칩 4개 + 연결선이 360px 에 들어가지 않는다) 활성 라벨만
 * 아래 줄에 `2 / 4 구매 정보` 형태로 둔다. 스텝 이동을 스크린리더가 읽도록 `aria-live` 를 건다.
 *
 * `role="tablist"` 는 쓰지 않는다 — roving tabindex + `aria-controls` 계약을 떠안게 되고,
 * 위저드는 tab 패턴이 아니다. `aria-current="step"` 이 정직한 표현이다.
 */
export const StepNav = ({ items, activeId, onSelect, ariaLabel, className }: Props) => {
  const activeIndex = items.findIndex((item) => item.id === activeId);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <nav aria-label={ariaLabel}>
        <ol className="flex items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, index) => {
            const isActive = item.id === activeId;
            const isDone = activeIndex !== -1 && index < activeIndex;
            const hasBadge = !!item.progress && item.progress.total > 0;

            return (
              <li key={item.id} className="flex shrink-0 items-center gap-1">
                {index > 0 && (
                  <span aria-hidden className="h-px w-4 shrink-0 bg-rule md:w-6" />
                )}
                {/* 이동 버튼은 제출 버튼이 되면 안 된다 — 반드시 type="button" */}
                <button
                  type="button"
                  onClick={() => onSelect?.(item.id)}
                  disabled={!onSelect}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border bg-surface px-2 py-1 text-body-4 transition-colors md:px-3 md:py-1.5",
                    "outline-none focus-visible:border-brand-primary focus-visible:ring-3 focus-visible:ring-brand-primary/25",
                    "disabled:cursor-default",
                    isActive
                      ? "border-brand-primary bg-brand-soft text-brand-dark"
                      : isDone
                        ? "border-rule text-ink hover:border-rule-dark"
                        : "border-rule text-muted-ink hover:border-rule-dark",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border text-caption",
                      isActive
                        ? "border-brand-primary bg-brand-primary text-white"
                        : isDone
                          ? "border-ink text-ink"
                          : "border-rule text-muted-ink",
                    )}
                  >
                    {isDone ? <Check size={12} strokeWidth={3} /> : index + 1}
                  </span>
                  <span className="max-md:sr-only">{item.label}</span>
                  {hasBadge && (
                    <Badge tone="brand" className="max-md:sr-only">
                      {item.progress!.done}/{item.progress!.total}
                    </Badge>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* 좁은 화면에서 라벨이 감춰지므로 활성 스텝을 한 줄로 알린다 */}
      <p aria-live="polite" className="text-caption text-muted-ink md:sr-only">
        {activeIndex + 1} / {items.length} {items[activeIndex]?.label}
      </p>
    </div>
  );
};
