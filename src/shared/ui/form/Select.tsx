import React from "react";
import {
  Select as SelectPrimitive,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldDescription } from "@shared/ui/primitives";
import { cn } from "@/lib/utils";

import { SearchableSelectControl } from "./SearchableSelectControl";

/**
 * `T` 를 도메인 유니온(`Grade` 등)으로 좁히면 라벨을 value 로 잘못 넘기는 실수가 컴파일 에러가 된다.
 * value ↔ 라벨 변환은 아래 `items` 가 전담하므로 호출부는 **도메인 원시값만** 넘긴다.
 */
export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectGroupOption<T extends string = string> {
  label?: string;
  options: SelectOption<T>[];
}

interface SelectBaseProps<T extends string> {
  // NoInfer: value 는 T 추론에 참여하지 않고 options 에서 정해진 T 로 "검사만" 받는다.
  // 이게 없으면 라벨(string)을 넘겼을 때 T 가 string 으로 넓어져 위반을 놓친다.
  // `""` 는 이 코드베이스의 "미선택" 표현이다(매칭되는 item 이 없어 placeholder 가 뜬다).
  value?: NoInfer<T> | "";
  defaultValue?: NoInfer<T> | "";
  onValueChange?: (value: NoInfer<T> | null) => void;

  placeholder?: string;
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
 * `searchable` 은 옵션이 서버에서 온 긴 목록일 때 켠다 (사업장·의뢰기관·측정장비·오염물질 등).
 * 고정 옵션(`@shared/model` 의 상수 배열 유래)에는 켜지 않는다 — 다섯 줄짜리 목록에
 * 검색창이 붙으면 고르는 동작만 한 단계 길어진다.
 *
 * **옵션 개수로 자동 판정하지 않는 것은 의도다.** 목록이 9개면 없고 11개면 생기면
 * 같은 화면이 데이터에 따라 달라져 아무도 무엇이 뜰지 예측하지 못한다.
 *
 * `groups` 와는 함께 쓸 수 없다 — 그룹 헤더와 필터링을 함께 맞추는 값을 치를 이유가
 * 아직 없다(`groups` 호출부는 현재 0곳이다). 선택 속성으로 두면 아무도 판단하지 않은 채
 * 기본값이 먹으므로 타입으로 막는다.
 */
type SelectVariantProps<T extends string> =
  | { searchable: true; options: SelectOption<T>[]; groups?: never }
  | { searchable?: false; options?: SelectOption<T>[]; groups?: SelectGroupOption<T>[] };

type SelectProps<T extends string> = SelectBaseProps<T> & SelectVariantProps<T>;

export const Select = <T extends string = string>({
  options,
  groups,
  searchable,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  label,
  helperText,
  errorMessage,
  id,
  disabled,
  required,
  className,
  size = "default",
}: SelectProps<T>) => {
  const renderItems = () => {
    if (groups) {
      return groups.map((group, index) => (
        <SelectGroup key={index}>
          {group.label && <SelectLabel>{group.label}</SelectLabel>}
          {group.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      ));
    }

    if (options) {
      return (
        <SelectGroup>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      );
    }

    return null;
  };

  // Base UI Select.Value는 items 매핑이 없으면 선택된 원시 value를 그대로 렌더링한다.
  // options/groups를 { value, label } 배열로 평탄화해 root에 넘겨 라벨이 표시되도록 한다.
  const items: SelectOption<T>[] = groups
    ? groups.flatMap((group) => group.options)
    : (options ?? []);

  const select = searchable ? (
    <SearchableSelectControl
      // 제네릭 좁히기는 이 컴포넌트의 props 경계에서 끝난다 — 아래 일반형과 같은 이유다.
      options={items as SelectOption<string>[]}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next as T | null)}
      placeholder={placeholder}
      id={id}
      disabled={disabled}
      className={className}
      size={size}
    />
  ) : (
    <SelectPrimitive
      // Base UI 는 value 를 넓은 string 으로 다룬다. 제네릭 좁히기는 이 컴포넌트의 props 경계에서 끝나고,
      // 여기서는 Base UI 계약에 맞춰 되돌린다 — 캐스팅을 이 한 곳에만 모으기 위한 의도적 처리다.
      items={items as SelectOption<string>[]}
      value={value as string | undefined}
      defaultValue={defaultValue as string | undefined}
      onValueChange={(next) => onValueChange?.(next as T | null)}
      disabled={disabled}
    >
      <SelectTrigger id={id} size={size} className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{renderItems()}</SelectContent>
    </SelectPrimitive>
  );

  if (!label) return select;

  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
        {errorMessage && (
          <span className="text-caption text-destructive">{errorMessage}</span>
        )}
      </FieldLabel>
      {select}
      {helperText && <FieldDescription>{helperText}</FieldDescription>}
    </Field>
  );
};
