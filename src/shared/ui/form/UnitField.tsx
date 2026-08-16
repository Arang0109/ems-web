import React from "react";
import { CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { HelpTip } from "@shared/ui/tooltip";
import { Select, type SelectOption } from "./Select";

interface Props {
  label: React.ReactNode;
  value: string;
  onChange?: (value: string) => void;

  /** 라벨 옆 도움말 — 용어 설명·계산식처럼 상시 노출하기엔 긴 안내 */
  hint?: React.ReactNode;
  /** 도움말 아이콘의 접근성 이름. 라벨이 문자열이 아닐 때(예: `O₂`) 지정한다 */
  hintLabel?: string;

  /** 있으면 Select 모드로 렌더링한다(입력창과 동일한 프레임 유지). */
  options?: SelectOption[];
  type?: React.HTMLInputTypeAttribute;

  /** 입력창 우측 단위 박스. 없으면 박스 자체를 그리지 않는다. */
  unit?: React.ReactNode;
  placeholder?: string;

  required?: boolean;
  disabled?: boolean;
  /** 자동계산 결과처럼 읽기 전용으로 보여줄 때 */
  readOnly?: boolean;

  min?: number;
  max?: number;
  step?: number;

  /** 입력창 아래 보조 영역 — 자동환산 행(CalcResultRow) 등 */
  helper?: React.ReactNode;
  /** 값 입력 여부를 알리는 우측 체크 아이콘. readOnly 필드에서는 끈다. */
  showComplete?: boolean;

  id?: string;
  className?: string;
}

/**
 * 피그마 "측정 데이터 입력" 화면의 입력 필드 원자.
 *
 * 라벨(+필수 표시) / 입력창(+단위 박스) / 완료 체크 아이콘 / 보조 행으로 구성된다.
 * 모바일 높이 48px, md 이상에서는 디자인 시스템 입력 스펙인 38px 로 줄어든다.
 *
 * 입력값 글자 크기 18px 는 타이포 10단계에 없는 값이라 이 컴포넌트 안에서만 예외로 둔다
 * (데스크탑은 text-body-2 = 14px).
 */
export const UnitField = ({
  label,
  value,
  onChange,
  hint,
  hintLabel,
  options,
  type = "text",
  unit,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  min,
  max,
  step,
  helper,
  showComplete = true,
  id,
  className,
}: Props) => {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const complete = value.trim() !== "";
  const withCheck = showComplete && !readOnly;

  const valueText = "text-body-2 max-md:text-[1.125rem]";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* 도움말 버튼은 label 밖에 둔다 — label 안의 버튼은 클릭이 입력창 포커스와 겹친다 */}
      <div className="flex items-center gap-1">
        <label htmlFor={fieldId} className="flex min-w-0 items-start gap-0.5 text-body-4 text-ink-soft">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
        {hint && (
          <HelpTip
            content={hint}
            label={hintLabel ?? (typeof label === "string" ? `${label} 설명` : "항목 설명")}
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-12 min-w-0 flex-1 items-stretch overflow-hidden rounded-button border md:h-[38px]",
            readOnly ? "border-rule bg-canvas" : "border-rule-dark bg-surface",
            !readOnly && !disabled &&
              "focus-within:border-brand-primary focus-within:ring-3 focus-within:ring-brand-primary/12",
            disabled && "bg-rule/40",
          )}
        >
          {options ? (
            <Select
              id={fieldId}
              value={value}
              options={options}
              placeholder={placeholder}
              disabled={disabled}
              onValueChange={(v) => onChange?.(v ?? "")}
              className={cn(
                "h-full rounded-none border-0 bg-transparent px-3 shadow-none",
                "data-[size=default]:h-full focus-visible:border-0 focus-visible:ring-0",
                "text-ink data-placeholder:text-muted-ink",
                valueText,
              )}
            />
          ) : (
            <input
              id={fieldId}
              type={type}
              value={value}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              min={min}
              max={max}
              step={step}
              onChange={(e) => onChange?.(e.target.value)}
              className={cn(
                "w-full min-w-0 bg-transparent px-3 outline-none",
                "placeholder:text-muted-ink disabled:cursor-not-allowed disabled:text-muted-ink",
                readOnly ? "text-ink-soft" : "text-ink",
                valueText,
              )}
            />
          )}

          {unit && (
            <span
              className={cn(
                "flex w-12 shrink-0 items-center justify-center border-l text-body-3 md:w-11",
                readOnly ? "border-rule bg-rule/40" : "border-rule bg-canvas",
                "text-ink-soft",
              )}
            >
              {unit}
            </span>
          )}
        </div>

        {withCheck && (
          <CircleCheck
            size={19}
            aria-hidden
            className={cn("shrink-0 text-brand-primary", !complete && "invisible")}
          />
        )}
      </div>

      {helper}
    </div>
  );
};
