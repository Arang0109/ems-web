import React from "react";
import { XIcon } from "lucide-react";
import {
  Select as SelectRoot,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldDescription } from "@shared/ui/primitives";
import { cn } from "@/lib/utils";

import type { SelectOption, SelectGroupOption } from "./Select";

interface BaseProps<T extends string> {
  // NoInfer: value 는 T 추론에 참여하지 않고 options 에서 정해진 T 로 "검사만" 받는다.
  // `Select` 와 같은 근거다 — 다만 미선택은 `""` 가 아니라 **빈 배열**이다.
  value: NoInfer<T>[];
  onValueChange: (value: NoInfer<T>[]) => void;

  placeholder?: string;
  /** 고를 항목이 하나도 없을 때 팝업에 뜨는 문구 */
  emptyText?: string;
  label?: React.ReactNode;
  helperText?: string;
  errorMessage?: string;

  id?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: "sm" | "default";
}

/**
 * 고른 항목을 목록에서도 구별한다 — 다중 선택은 목록이 열린 채로 여러 번 오가므로
 * 오른쪽 ✓ 하나로는 어디까지 골랐는지 훑기 어렵다.
 *
 * **강조(지금 커서가 있는 줄)와 선택(이미 고른 줄)은 동시에 성립하므로 속성을 갈라 놓는다** —
 * 강조는 공유 클래스(`selectItemClassName` 의 `focus:`)가 면과 글자를 통째로 가져가고,
 * 선택은 **강조가 없을 때만** 면·글자를 칠한다. 겹치는 자리를 남기면 클래스 생성 순서에 따라
 * 이겼다 졌다 한다. 강조 중에도 남는 단서는 `font-medium` 과 ✓ 두 가지다
 * (색만으로 구분하지 않는다 — DESIGN-SYSTEM.md 의 상태 표기 원칙).
 *
 * **대괄호 형식(`data-[selected]`)을 쓴다.** Base UI 는 불리언 상태를 `data-selected=""`(빈 문자열)로
 * 내보내는데, 축약형 `data-selected:` 는 Tailwind 가 `[data-selected=true]` 로 컴파일해 영영 맞지 않는다.
 */
const selectedItemClassName = cn(
  "data-[selected]:font-medium",
  "data-[selected]:not-data-[highlighted]:bg-brand-soft",
  "data-[selected]:not-data-[highlighted]:text-brand-dark",
);

/**
 * 평면 목록(`options`)이거나 머리글 있는 묶음(`groups`)이거나 — **둘 중 하나를 반드시 고른다.**
 * 선택 속성 두 개로 두면 아무도 판단하지 않은 채 기본값이 먹는다(`Select` 의 판별 유니온과 같은 근거).
 */
type VariantProps<T extends string> =
  | { options: SelectOption<T>[]; groups?: never }
  | { groups: SelectGroupOption<T>[]; options?: never };

type Props<T extends string> = BaseProps<T> & VariantProps<T>;

/**
 * 칩(chip)형 다중 선택. 고른 항목이 트리거 안에 pill 로 쌓이고 각 칩의 ✕ 로 개별 해제한다.
 *
 * **단일 선택은 `Select` 다.** 값 계약이 다르므로(`""` vs `[]`) 한 컴포넌트로 합치지 않는다 —
 * `Select` 의 `value?: T | ""` / `onValueChange?: (T | null) => void` 는 스칼라 전제이고,
 * 배열을 얹으려면 판별 유니온이 아니라 base props 까지 갈라야 한다.
 *
 * 검색 입력은 달지 않는다. 필요해지면 `SearchableSelectControl` 처럼 Base UI `combobox` 의
 * `multiple` + `chips` 파트로 별도 컨트롤을 만든다 — 지금 쓰는 곳(측정시설별 측정항목)은
 * 목록이 소수라 검색창이 고르는 동작만 한 단계 늘린다(`Select.tsx` 의 `searchable` 기준과 같다).
 *
 * 생김새는 shadcn select 가 소유한 클래스 상수를 `SelectTrigger`·`SelectContent`·`SelectItem`
 * 을 통해 그대로 물려받는다. 클래스 문자열을 복사하지 않는다.
 */
export const MultiSelect = <T extends string = string>({
  options,
  groups,
  value,
  onValueChange,
  placeholder,
  emptyText = "선택할 항목이 없습니다.",
  label,
  helperText,
  errorMessage,
  id,
  disabled,
  required,
  className,
  size = "default",
}: Props<T>) => {
  // 칩 라벨·빈 목록 판정은 평탄화한 배열에서 한다 (`Select.tsx` 의 `items` 와 같은 관용구).
  const items: SelectOption<T>[] = groups
    ? groups.flatMap((group) => group.options)
    : (options ?? []);

  // 칩에 쓸 라벨. 옵션에서 사라진 값(상위 선택이 바뀌는 순간 등)은 원시 value 로 버틴다.
  const labelOf = (v: string) => items.find((opt) => opt.value === v)?.label ?? v;

  const renderItem = (opt: SelectOption<T>) => (
    <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled} className={selectedItemClassName}>
      {opt.label}
    </SelectItem>
  );

  const removeValue = (v: string) => {
    onValueChange(value.filter((selected) => selected !== v));
  };

  const control = (
    <SelectRoot
      multiple
      value={value as string[]}
      onValueChange={(next) => onValueChange(next as NoInfer<T>[])}
      disabled={disabled}
    >
      {/*
        트리거를 `<div>` 로 렌더한다 — 칩의 ✕ 가 `<button>` 이라 네이티브 버튼 안에 넣을 수 없다.
        `nativeButton={false}` 가 Base UI 에게 role·tabIndex·키보드 활성화를 대신 붙이라고 알린다.

        높이 규칙도 덮는다. 공유 클래스는 `data-[size=*]:h-*` + `whitespace-nowrap` 이라
        칩이 줄바꿈되지 않는다. `:disabled` 도 div 에는 걸리지 않아 `data-[disabled]` 로 바꾼다.
      */}
      <SelectTrigger
        id={id}
        size={size}
        nativeButton={false}
        render={<div />}
        aria-invalid={errorMessage ? true : undefined}
        aria-required={required || undefined}
        className={cn(
          "w-full whitespace-normal py-1.5",
          "data-[size=default]:h-auto data-[size=default]:min-h-[38px]",
          "data-[size=sm]:h-auto data-[size=sm]:min-h-8",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          className,
        )}
      >
        {/* 칩은 한 덩어리로 묶어 둔다 — 트리거의 `justify-between` 이 셰브론을 오른쪽 끝에 붙인 채로
            칩만 줄바꿈되게 하려면 래퍼가 필요하다. */}
        <span data-slot="select-value" className="flex flex-1 flex-wrap items-center gap-1.5">
          {value.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            value.map((v) => {
              const text = labelOf(v);
              return (
                <span
                  key={v}
                  // 피그마 "오염물질 칩" — Soft 면 + 브랜드 테두리 (DESIGN-SYSTEM.md 화면 시안).
                  className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full border border-brand-primary bg-brand-soft pl-2.5 pr-1 text-label text-brand-dark"
                >
                  {text}
                  {/* Base UI Select 는 pointerdown 에서 열린다 — ✕ 는 두 이벤트 모두 막아야
                      해제하면서 팝업이 따라 열리지 않는다. */}
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={`${text} 선택 해제`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeValue(v);
                    }}
                    className="flex size-4 items-center justify-center rounded-full outline-none hover:bg-brand-primary/20 focus-visible:ring-2 focus-visible:ring-brand-primary/40 disabled:pointer-events-none"
                  >
                    <XIcon className="size-3" />
                  </button>
                </span>
              );
            })
          )}
        </span>
      </SelectTrigger>

      {/* 기본값(true)은 고른 항목을 커서에 맞춰 팝업이 트리거를 덮는 동작이라 다중 선택에 맞지 않는다. */}
      <SelectContent align="start" alignItemWithTrigger={false}>
        {items.length === 0 ? (
          <div className="px-2 py-6 text-center text-body-3 text-muted-foreground">{emptyText}</div>
        ) : groups ? (
          // 그룹 사이를 여백(`SelectGroup` 의 p-1)만으로 가르면 묶음이 읽히지 않는다.
          // 두 번째 묶음부터 구분선을 얹는다 — `SelectSeparator` 를 형제로 끼우면
          // `Select.List` 의 항목 순회에 빈 노드가 낀다.
          groups.map((group, index) => (
            <SelectGroup key={index} className={index > 0 ? "border-t border-rule" : undefined}>
              {group.label && <SelectLabel>{group.label}</SelectLabel>}
              {group.options.map(renderItem)}
            </SelectGroup>
          ))
        ) : (
          <SelectGroup>{items.map(renderItem)}</SelectGroup>
        )}
      </SelectContent>
    </SelectRoot>
  );

  if (!label) return control;

  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
        {errorMessage && <span className="text-caption text-destructive">{errorMessage}</span>}
      </FieldLabel>
      {control}
      {helperText && <FieldDescription>{helperText}</FieldDescription>}
    </Field>
  );
};
