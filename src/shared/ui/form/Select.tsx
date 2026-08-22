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

interface SelectProps<T extends string> {
  options?: SelectOption<T>[];
  groups?: SelectGroupOption<T>[];

  // NoInfer: value 는 T 추론에 참여하지 않고 options 에서 정해진 T 로 "검사만" 받는다.
  // 이게 없으면 라벨(string)을 넘겼을 때 T 가 string 으로 넓어져 위반을 놓친다.
  // `""` 는 이 코드베이스의 "미선택" 표현이다(매칭되는 item 이 없어 placeholder 가 뜬다).
  value?: NoInfer<T> | "";
  defaultValue?: NoInfer<T> | "";
  onValueChange?: (value: NoInfer<T> | null) => void;

  placeholder?: string;
  label?: React.ReactNode;
  helperText?: string;

  id?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: "sm" | "default";
}

export const Select = <T extends string = string>({
  options,
  groups,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  label,
  helperText,
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

  const select = (
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
      </FieldLabel>
      {select}
      {helperText && <FieldDescription>{helperText}</FieldDescription>}
    </Field>
  );
};
