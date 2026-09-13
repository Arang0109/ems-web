import type { FieldTone } from "@shared/model";
import { cn } from "@/lib/utils";

/** 톤별 셀 면 색 — `default` 는 칠하지 않는다 */
const TONE_CELL: Record<Exclude<FieldTone, "default">, string> = {
  info: "bg-info-soft",
  danger: "bg-danger-soft",
};

/**
 * 입력 셀(`TableInputCell`·`TableSelectCell`)의 면 색.
 *
 * `UnitField` 의 프레임 규칙과 같다 — 값이 들어차면 연초록(완료), 톤은 그보다 **뒤에** 와서
 * 완료를 덮는다(확인·누락이 "다 채웠다"보다 급한 소식이다). 표 셀은 테두리가 표의 것이라
 * 면 색만 바꾸고, 테두리 색은 `field-tone` 의 프레임 맵과 별개다.
 */
export const cellFaceClass = (tone: FieldTone, filled: boolean): string =>
  cn(filled && "bg-brand-soft", tone !== "default" && TONE_CELL[tone]);

/**
 * 완료로 칠할 것인가 — 사람이 채울 수 있는 칸에 값이 있을 때만.
 * 비활성 칸은 이제 손댈 수 없는 값이라 완료의 대상이 아니다.
 */
export const isCellFilled = (value: string, { showComplete, disabled }: {
  showComplete: boolean; disabled: boolean;
}): boolean => showComplete && !disabled && value.trim() !== "";
