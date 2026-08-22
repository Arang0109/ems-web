import type { InspectionRecordForm } from "./types";

export const validateInspectionRecordFields = (form: InspectionRecordForm) => {
  const errors: Partial<Record<keyof InspectionRecordForm, string>> = {};

  if (!form.inspectedAt) {
    errors.inspectedAt = '검사 실시일을 선택해주세요.';
  }

  // 서버는 유효기간을 실시일과 비교하지 않지만, 만료일이 실시일보다 이르면 명백한 오입력이다.
  if (form.validUntil && form.inspectedAt && form.validUntil < form.inspectedAt) {
    errors.validUntil = '유효기간 만료일은 검사 실시일 이후여야 합니다.';
  }

  return errors;
};
