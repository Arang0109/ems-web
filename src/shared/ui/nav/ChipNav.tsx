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
 * 활성 칩은 브랜드 테두리 + Dark 글씨로 구분한다(색만으로 구분하지 않도록 위치도 유지).
 */
export const ChipNav = ({ items, activeId, onSelect, className, ariaLabel }: Props) => (
  <nav
    aria-label={ariaLabel}
    className={cn(
      "p-0.5 flex gap-2 overflow-x-auto scrollbar-width:none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
      className,
    )}
  >
    {items.map((item) => {
      const active = item.id === activeId;
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          aria-current={active ? "true" : undefined}
          className={cn(
            "shrink-0 rounded-full border bg-surface px-3 py-1.5 text-body-4 transition-colors",
            "outline-none focus-visible:border-brand-primary focus-visible:ring-3 focus-visible:ring-brand-primary/25",
            active
              ? "border-brand-primary bg-brand-soft text-brand-dark"
              : "border-rule text-ink-soft hover:border-rule-dark",
          )}
        >
          {item.label}
        </button>
      );
    })}
  </nav>
);
