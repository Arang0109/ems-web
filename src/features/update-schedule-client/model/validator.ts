import type { ScheduleClientUpdateForm } from "./types";

const NUMERIC_FIELDS = [
  "standardOxygen", "height", "horizontalLength", "verticalLength",
] as const;

// 서버는 빈 값을 "기존 값 유지"로 처리하므로 화면에서 지워도 실제로는 삭제되지 않는다.
// 사용자가 "지웠다 = 없앴다"로 오해하지 않도록, 비울 수 없는 필드는 제출 전에 차단한다.
export const validateScheduleClientFields = (form: ScheduleClientUpdateForm) => {
  const errors: Partial<Record<keyof ScheduleClientUpdateForm, string>> = {};

  if (!form.name.trim()) errors.name = "의뢰기관명을 입력해주세요.";
  if (!form.workplaceName.trim()) errors.workplaceName = "사업장명을 입력해주세요.";
  if (!form.stackName.trim()) errors.stackName = "측정시설명을 입력해주세요.";
  if (!form.stackSemsNumber.trim()) errors.stackSemsNumber = "SEMS 번호를 입력해주세요.";
  if (!form.height.trim()) errors.height = "측정공 높이를 입력해주세요.";

  if (!form.horizontalLength.trim()) {
    errors.horizontalLength = form.shape === "CIRCULAR"
      ? "지름을 입력해주세요."
      : "가로 길이를 입력해주세요.";
  }

  if (form.shape === "RECTANGULAR" && !form.verticalLength.trim()) {
    errors.verticalLength = "세로 길이를 입력해주세요.";
  }

  // standardOxygen·businessCategory·mainProduct는 선택 항목이라 빈 값을 허용한다.
  for (const key of NUMERIC_FIELDS) {
    const raw = form[key].trim();
    if (raw && Number.isNaN(Number(raw.replace(/[,\s]/g, "")))) {
      errors[key] = "숫자만 입력해주세요.";
    }
  }

  return errors;
};
