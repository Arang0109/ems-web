import type { SheetForm } from "./types";

// 시트 최소 유효성 — 측정점 1개 이상, 대기압 입력 정도만 확인한다(부분 저장 허용).
export const validateSheetFields = (form: SheetForm): string[] => {
  const errors: string[] = [];

  const label = form.category;
  if (form.measurementPoints.length === 0) {
    errors.push(`[${label}] 측정점을 1개 이상 입력해주세요.`);
  }

  return errors;
};
