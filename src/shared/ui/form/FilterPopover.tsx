import React from "react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@shared/ui/badges";
import { Button } from "@shared/ui/buttons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  /** 트리거 아이콘 — 테이블 필터 바에서는 `ListFilter` */
  icon?: LucideIcon;
  /** 트리거 라벨. 생략하면 아이콘만 노출한다 */
  label?: string;
  /** 기본값과 달라진 조건 개수. 0 보다 크면 트리거가 선택 상태가 되고 개수 배지를 단다 */
  activeCount?: number;
  /** 접근성 이름 — 라벨 없는 아이콘 트리거에 필수 */
  ariaLabel?: string;
  /** 팝오버 상단 제목 */
  title?: string;
  applyLabel?: string;
  resetLabel?: string;
  /** 적용 — 호출 후 팝오버를 닫는다 */
  onApply?: () => void;
  /** 초기화 — 값만 되돌리고 팝오버는 열어 둔다 */
  onReset?: () => void;
  /** 열릴 때 호출. 편집하다 만 임시값을 적용값으로 되돌리는 데 쓴다 */
  onOpen?: () => void;
  className?: string;
  children: React.ReactNode;
}

/**
 * 테이블 필터 바의 조건 묶음을 담는 팝오버 셸.
 *
 * 조건 하나짜리는 `FilterSelect`(칩형 셀렉트)로 충분하고, 기간처럼 입력이 여러 개이거나
 * "적용"이라는 확정 시점이 필요한 조건을 이 셸에 담는다. 조건 본문은 호출부가 `children` 으로
 * 넘기고, 셸은 트리거 상태 표시·열림 상태·확정/초기화 버튼만 책임진다.
 */
export const FilterPopover = ({
  icon: Icon,
  label,
  activeCount = 0,
  ariaLabel,
  title,
  applyLabel = "적용",
  resetLabel = "초기화",
  onApply,
  onReset,
  onOpen,
  className,
  children,
}: Props) => {
  const [open, setOpen] = React.useState(false);

  const isActive = activeCount > 0;
  const hasTriggerContent = Boolean(label) || isActive;

  const handleOpenChange = (next: boolean) => {
    if (next) onOpen?.();
    setOpen(next);
  };

  const handleApply = () => {
    onApply?.();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            startIcon={Icon}
            variant={isActive ? "selected" : "outline"}
            size={hasTriggerContent ? "lg" : "icon-lg"}
            aria-label={ariaLabel}
            className={className}
          >
            {label}
            {isActive && (
              <Badge tone="brand" className="h-5 min-w-5 px-1.5">
                {activeCount}
              </Badge>
            )}
          </Button>
        }
      />

      <PopoverContent align="end" className={cn("flex w-fit min-w-64 flex-col gap-3 p-4")}>
        {title && <p className="text-body-4 text-ink">{title}</p>}

        {children}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onReset}>
            {resetLabel}
          </Button>
          <Button size="sm" onClick={handleApply}>
            {applyLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
