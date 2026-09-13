import React from "react";
import { History } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FieldTone } from "@shared/model";
import { HelpTip } from "@shared/ui/tooltip";
import { toneFrameClass } from "./field-tone";
import { InFieldLabel } from "./InFieldLabel";
import { IN_FIELD_SELECT_CLASS, IN_FIELD_VALUE_CLASS } from "./in-field";
import { NumericField } from "./NumericField";
import { Select, type SelectOption } from "./Select";
import { TimeField } from "./TimeField";

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
  /** Select 모드에서 서버에서 온 긴 목록이면 켠다 — 팝업 안에 검색 입력이 붙는다 */
  searchable?: boolean;
  type?: React.HTMLInputTypeAttribute;

  /** 라벨 줄 뒤에 괄호로 붙는 단위 — `대기압 (hPa)`. 없으면 라벨만 나온다. */
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
  /** 값이 들어차면 면을 연초록으로 물들인다. 완료 개념이 없는 칸에서는 끈다. */
  showComplete?: boolean;

  /**
   * 칸의 상태 색. 의미는 호출부가 정한다 — shared 는 "왜 그 색인지" 모른다.
   * 우측 상태 아이콘도 함께 갈려서 **색 없이도 상태가 읽힌다**.
   */
  tone?: FieldTone;
  /**
   * 이 칸에 포커스가 들어왔을 때. 프레임 전체에 걸어 두므로 입력창·Select 트리거·
   * ± 버튼·시계 버튼 어디로 들어와도 한 번 불린다.
   */
  onFocus?: () => void;

  id?: string;
  className?: string;
}

/**
 * 값 영역은 라벨 높이만큼 내려야 라벨과 겹치지 않는다.
 * 모바일은 값 글자가 18px 이라 한 단계 더 내린다 — 프레임도 그만큼(56px) 높다.
 */
const LABELED_VALUE_CLASS = cn(IN_FIELD_VALUE_CLASS, "max-md:pt-6");

/**
 * 피그마 "측정 데이터 입력" 화면의 입력 필드 원자.
 *
 * 칸 안 상단 좌측 라벨(+필수 표시·단위·도움말) / 입력창 / 우상단 상태 아이콘 /
 * 보조 행으로 구성된다. 프레임 높이는 모바일 56px, md 이상 48px 이다
 * (`InputGroup` 의 인필드 라벨과 같은 규칙).
 *
 * **상태는 프레임이 말한다** — 완료는 면 색(`bg-brand-soft`), 톤은 테두리+면+우상단 아이콘.
 * 칸 바깥 아이콘 열은 없앴다: 기록지 한 장이 수십 칸이라 체크가 줄줄이 서면 값이 안 읽히고,
 * 그 열이 칸마다 입력 폭을 27px 씩 먹었다.
 *
 * 단위는 **라벨 줄 뒤 괄호**로 붙는다 — 우측 회색 단위 박스는 고정폭(44~48px)이라
 * 모바일에서 입력 폭을 갉아먹고, 면 색 때문에 값보다 먼저 눈에 들었다.
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
  searchable,
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
  tone = "default",
  onFocus,
  id,
  className,
}: Props) => {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  // 완료는 **사람이 채운 칸**에만 물든다 — 자동계산 결과 칸은 완료의 대상이 아니다
  const filled = showComplete && !readOnly && value.trim() !== "";
  // 톤은 값을 고칠 수 있는 칸에서만 의미가 있다 — 읽기 전용 결과 칸까지 물들이지 않는다.
  const activeTone = readOnly ? "default" : tone;

  // 안내 톤은 "값은 있는데 확인이 필요하다"는 뜻이라 글자까지 물들여야 눈에 든다.
  const valueText = cn(
    "text-body-2",
    activeTone === "info" && "text-info-ink",
  );

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-2">
        {/* 포커스 감지는 프레임에 건다 — 입력창·Select 트리거·± 버튼 어디로 들어와도 한 번 잡힌다 */}
        <div
          onFocusCapture={onFocus}
          className={cn(
            "relative flex min-w-0 flex-1 items-stretch overflow-hidden rounded-button border h-12",
            readOnly ? "border-rule bg-canvas" : "border-rule-dark bg-surface",
            // 완료는 색만으로 알린다 — 값이 칸에 보이는 것이 이미 완료의 증거다
            filled && "bg-brand-soft",
            // 톤이 완료보다 **뒤에** 온다 — 확인·누락이 "다 채웠다"보다 급한 소식이다
            toneFrameClass(activeTone),
            !readOnly && !disabled &&
              "focus-within:border-brand-primary focus-within:ring-3 focus-within:ring-brand-primary/12",
            disabled && "bg-rule/40",
          )}
        >
          {/*
            상태는 색이 아니라 **아이콘 모양**으로도 구분된다 — 안내는 시계, 오류는 경고.
            완료만 아이콘이 없다: 값이 칸에 그대로 보이는 것이 이미 완료의 증거다.
            라벨 줄과 같은 높이라 ± 버튼·시계 버튼이 있는 값 영역과 겹치지 않는다.
          */}
          {activeTone === "info" && (
            <History size={14} aria-hidden className="pointer-events-none absolute top-1.5 right-1.5 z-10 text-info" />
          )}

          <InFieldLabel
            htmlFor={fieldId}
            required={required}
            unit={unit}
            invalid={activeTone === "danger"}
            disabled={disabled}
            // 입력창 좌패딩(px-3)에 글줄 시작점을 맞춘다
            className="left-3"
            // 도움말 버튼은 label 밖에 둔다 — label 안의 버튼은 클릭이 입력창 포커스와 겹친다
            addon={
              hint && (
                <HelpTip
                  content={hint}
                  label={hintLabel ?? (typeof label === "string" ? `${label} 설명` : "항목 설명")}
                />
              )
            }
          >
            {label}
          </InFieldLabel>

          {options ? (
            // `searchable` 은 Select 에서 판별 유니온이라(groups 와 동시 사용 금지) 분기해 넘긴다.
            (() => {
              const selectProps = {
                id: fieldId,
                value,
                placeholder,
                disabled,
                onValueChange: (v: string | null) => onChange?.(v ?? ""),
                className: cn(
                  "h-full rounded-none border-0 bg-transparent px-3 shadow-none",
                  "data-[size=default]:h-full focus-visible:border-0 focus-visible:ring-0",
                  "text-ink data-placeholder:text-muted-ink",
                  LABELED_VALUE_CLASS,
                  IN_FIELD_SELECT_CLASS,
                  valueText,
                ),
              };

              return searchable ? (
                <Select searchable options={options} {...selectProps} />
              ) : (
                <Select options={options} {...selectProps} />
              );
            })()
          ) : type === "time" && !readOnly ? (
            /* 네이티브 시각 위젯은 브라우저마다 폭·모양이 달라 프레임과 어긋난다 */
            <TimeField
              id={fieldId}
              value={value}
              onChange={(v) => onChange?.(v)}
              frame="none"
              disabled={disabled}
              label={typeof label === "string" ? label : hintLabel}
              className={LABELED_VALUE_CLASS}
              inputClassName={valueText}
            />
          ) : type === "number" && !readOnly ? (
            /* 모바일 숫자 키패드에는 `-` 가 없다 — 부호는 ± 버튼이 맡는다 */
            <NumericField
              id={fieldId}
              value={value}
              onChange={(v) => onChange?.(v)}
              allowNegative={min === undefined || min < 0}
              step={step}
              frame="none"
              disabled={disabled}
              placeholder={placeholder}
              label={typeof label === "string" ? label : hintLabel}
              className={LABELED_VALUE_CLASS}
              inputClassName={valueText}
            />
          ) : (
            <input
              id={fieldId}
              type={type}
              value={value}
              aria-invalid={activeTone === "danger" || undefined}
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
                LABELED_VALUE_CLASS,
                valueText,
              )}
            />
          )}
        </div>
      </div>

      {helper}
    </div>
  );
};
