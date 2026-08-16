import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import type { SelectOption } from "./Select";

interface Props {
  options: SelectOption[];

  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;

  /** 트리거 좌측 아이콘. 피그마 시안은 팀 필터의 `Users` */
  icon?: LucideIcon;
  placeholder?: string;
  /** 접근성 이름 — 필터 바에 셀렉트가 여러 개일 때 구분 */
  ariaLabel?: string;

  disabled?: boolean;
  /** 폭·정렬은 호출부가 결정한다. 미지정 시 내용 폭 */
  className?: string;
}

/**
 * 테이블 상단 필터 바에 놓는 칩형 단일선택 셀렉트.
 *
 * 라벨·헬퍼 텍스트를 갖는 폼 필드용 `Select` 와 달리 내용 폭(`w-fit`)이며,
 * shadcn 래퍼(@/components/ui/select)를 거치지 않고 Base UI 동작 레이어를 직접 사용한다
 * (스타일 레이어만 걷어내고 키보드 내비게이션·포커스·ARIA 는 그대로 유지).
 *
 * 값·onChange 는 호출부(위젯)가 관리한다.
 */
export const FilterSelect = ({
  options,
  value,
  defaultValue,
  onValueChange,
  icon: Icon,
  placeholder,
  ariaLabel,
  disabled,
  className,
}: Props) => (
  // Base UI Select.Value 는 items 매핑이 없으면 선택된 원시 value 를 그대로 렌더링한다.
  // options 를 root 에 넘겨 라벨이 표시되도록 한다 (`Select.tsx` 와 동일한 이유).
  <SelectPrimitive.Root
    items={options}
    value={value}
    defaultValue={defaultValue}
    onValueChange={onValueChange}
    disabled={disabled}
  >
    <SelectPrimitive.Trigger
      aria-label={ariaLabel}
      className={cn(
        "inline-flex h-9 w-fit shrink-0 items-center gap-1 whitespace-nowrap select-none",
        "rounded-button border border-rule-dark bg-surface px-3",
        "text-body-4 text-ink-soft transition-colors hover:bg-brand-soft",
        // FOCUS — 초록 테두리 + 초록 링 (Button outline variant 와 동일)
        "outline-none focus-visible:border-brand-primary focus-visible:ring-3 focus-visible:ring-brand-primary/25",
        // DISABLED — 회색 면 + muted 텍스트
        "disabled:pointer-events-none disabled:border-transparent disabled:bg-rule disabled:text-muted-ink",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
    >
      {Icon && <Icon />}
      <SelectPrimitive.Value
        placeholder={placeholder}
        className="flex-1 text-left data-placeholder:text-muted-ink"
      />
      <SelectPrimitive.Icon render={<ChevronDownIcon />} />
    </SelectPrimitive.Trigger>

    <SelectPrimitive.Portal>
      {/* alignItemWithTrigger 기본값(true)은 네이티브 select 처럼 팝업이 트리거를 덮는다.
          필터 칩은 아래로 펼쳐져야 하므로 끈다 (side·sideOffset 도 이때만 적용된다). */}
      <SelectPrimitive.Positioner
        side="bottom"
        sideOffset={4}
        align="start"
        alignItemWithTrigger={false}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          className={cn(
            "max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto",
            "rounded-nav border border-rule bg-surface p-1 shadow-panel",
          )}
        >
          <SelectPrimitive.List>
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className={cn(
                  "relative flex w-full cursor-default items-center rounded-button py-1.5 pr-8 pl-2",
                  "text-body-3 text-ink-soft outline-none select-none",
                  "focus:bg-brand-soft focus:text-brand-dark",
                  "data-disabled:pointer-events-none data-disabled:opacity-50",
                )}
              >
                <SelectPrimitive.ItemText className="flex-1 whitespace-nowrap">
                  {opt.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator
                  render={
                    <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
                  }
                >
                  {/* Primary 는 면 전용, 밝은 배경 위 아이콘은 Dark */}
                  <CheckIcon className="size-4 text-brand-dark" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  </SelectPrimitive.Root>
);
