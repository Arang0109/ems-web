import { cn } from "@/lib/utils";

export interface ChipNavItem {
  id: string;
  label: string;
}

interface Props {
  items: ChipNavItem[];
  activeId?: string;
  onSelect: (id: string) => void;
  className?: string;
  /** 접근성 라벨 — 화면에 여러 ChipNav 가 있을 때 구분 */
  ariaLabel?: string;
}

/**
 * 가로 스크롤 pill 칩 내비게이션 — 긴 폼의 섹션 바로가기에 사용한다.
 * 활성 칩은 브랜드 테두리 · 연한 브랜드 면 · 굵은 브랜드 글씨로 구분한다(색만으로 구분하지 않도록 위치도 유지).
 */
export const ChipNav = ({ items, activeId, onSelect, className, ariaLabel }: Props) => (
  <nav
    aria-label={ariaLabel}
    className={cn(
      // p-0.5 : 포커스 링이 스크롤 컨테이너에 잘리지 않게 할 여유
      "p-0.5 flex gap-1.75 overflow-x-auto scrollbar-none",
      className,
    )}
  >
    {items.map((item) => {
      const active = item.id === activeId;
      return (
        <button
          key={item.id}
          type="button"
          onClick={(e) => {
            // 화면 밖에 걸친 칩을 누르면 전부 보이도록 가로로 당겨 온다
            e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
            onSelect(item.id);
          }}
          aria-current={active ? "true" : undefined}
          className={cn(
            // 피그마 MO 시안: 높이 36 · 좌우 13 · 활성 13/600 브랜드, 비활성 13/400 Ink Soft
            "min-h-9 shrink-0 rounded-full border bg-surface px-3.25 py-1.5 whitespace-nowrap transition-colors",
            "outline-none focus-visible:border-brand-primary focus-visible:ring-3 focus-visible:ring-brand-primary/25",
            active
              ? "border-brand-primary bg-brand-soft text-body-4 text-brand-primary"
              : "border-rule text-body-3 text-ink-soft hover:border-rule-dark",
          )}
        >
          {item.label}
        </button>
      );
    })}
  </nav>
);
