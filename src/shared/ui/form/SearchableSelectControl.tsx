import { Combobox } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";

import {
  selectItemClassName,
  selectPopupClassName,
  selectTriggerClassName,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { SelectOption } from "./Select";

interface Props {
  options: SelectOption<string>[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;

  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;

  id?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default";
}

/**
 * 검색 입력이 달린 Select 의 **컨트롤 부분**. `Select` 가 `searchable` 일 때만 쓴다.
 *
 * 배럴에 노출하지 않는다 — 라벨·helperText 같은 껍데기는 `Select` 가 소유하고 여기는
 * 컨트롤만 그린다. 호출부는 언제나 `<Select searchable />` 을 쓴다.
 *
 * Base UI `combobox` 를 직접 조립한다(shadcn 래퍼 미경유). `Drawer`·`Tabs`·`Tooltip` 과 같은
 * 방식이며, 생김새는 shadcn select 가 소유한 클래스 상수를 그대로 읽어 일반형과 어긋나지 않게 한다.
 *
 * 값 계약은 `Select` 와 동일하다 — 바깥은 `""`(미선택)를 쓰고 Base UI 는 `null` 을 쓰므로
 * 이 컴포넌트의 경계에서만 변환한다.
 */
export const SearchableSelectControl = ({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  searchPlaceholder = "검색",
  emptyText = "검색 결과가 없습니다.",
  id,
  disabled,
  className,
  size = "default",
}: Props) => (
  <Combobox.Root
    // items 를 넘기면 두 가지가 따라온다 — 필터링 대상이 되고(mode 기본값 `list`),
    // 선택된 원시 value 가 items 에서 label 로 해석된다. Select 가 items 를 넘기는 이유와 같다.
    items={options}
    value={value === "" ? null : value}
    defaultValue={defaultValue === "" ? null : defaultValue}
    onValueChange={(next) => onValueChange?.((next as string | null) ?? null)}
    disabled={disabled}
  >
    <Combobox.Trigger
      id={id}
      data-slot="select-trigger"
      data-size={size}
      className={cn(selectTriggerClassName, "w-full", className)}
    >
      {/* 트리거의 `*:data-[slot=select-value]:...` 규칙이 이 span 을 잡는다.
          Combobox.Value 는 자체 요소를 그리지 않으므로 여기서 감싼다. */}
      <span data-slot="select-value" className="flex flex-1 text-left">
        <Combobox.Value placeholder={placeholder} />
      </span>
      <Combobox.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
        }
      />
    </Combobox.Trigger>

    <Combobox.Portal>
      <Combobox.Positioner side="bottom" sideOffset={4} align="start" className="isolate z-50">
        <Combobox.Popup data-slot="select-content" className={cn(selectPopupClassName, "flex flex-col")}>
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-popover px-2.5">
            <SearchIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
            <Combobox.Input
              placeholder={searchPlaceholder}
              className="h-9 w-full bg-transparent text-body-3 outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Empty 는 목록이 비어도 **마운트를 유지해야** 스크린리더가 변화를 읽는다.
              조건부 렌더 대신 children 만 바뀌도록 둔다(Base UI 문서의 요구사항). */}
          <Combobox.Empty className="text-center text-body-3 text-muted-foreground">
            {/* 여백을 안쪽 span 이 들고 있어야 한다. 결과가 있을 때 Empty 는 children 만 비우고
                요소는 남는데, 바깥에 패딩이 있으면 빈 칸이 팝업 위에 그대로 뜬다.
                `display:none` 으로 감추는 방법은 쓰지 않는다 — 이 요소가 스크린리더에
                결과 없음을 알리는 live 영역이라 마운트를 유지해야 한다(Base UI 요구사항). */}
            <span className="block px-2 py-6">{emptyText}</span>
          </Combobox.Empty>

          <Combobox.List className="scroll-my-1 overflow-y-auto p-1">
            {(item: SelectOption<string>) => (
              <Combobox.Item
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                // 공유 클래스는 `focus:` 로 강조색을 넣는데, Combobox 는 포커스가 검색 입력에
                // 머물러 아이템에 `:focus` 가 오지 않는다. Base UI 가 대신 두 상태를 붙인다 —
                // `data-highlighted`(마우스 호버·키보드 이동이 모두 여기로 들어온다)와
                // `data-selected`(지금 고른 값).
                //
                // 두 상태는 동시에 성립하므로 **속성이 겹치지 않게 갈라 놓는다** — 강조는 면(bg),
                // 선택은 글자(색·굵기)를 맡는다. 겹치면 클래스 생성 순서에 따라 이겼다 졌다 한다.
                // 선택 항목의 면은 강조가 없을 때만 칠해 둘이 부딪히지 않게 한다.
                //
                // **대괄호 형식(`data-[selected]`)을 쓴다.** Base UI 는 불리언 상태를
                // `data-selected=""`(빈 문자열)로 내보내는데, 축약형 `data-selected:` 는
                // Tailwind 가 `[data-selected=true]` 로 컴파일해 영영 맞지 않는다.
                className={cn(
                  selectItemClassName,
                  "data-[highlighted]:bg-accent",
                  "data-[selected]:font-medium data-[selected]:text-brand-dark",
                  "data-[selected]:not-data-[highlighted]:bg-brand-soft",
                )}
              >
                <span className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">{item.label}</span>
                <Combobox.ItemIndicator
                  render={
                    <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
                  }
                >
                  <CheckIcon className="pointer-events-none size-4" />
                </Combobox.ItemIndicator>
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
);
