import type { PollutantRegisterForm } from "./types";

export const validatePollutantRegisterFields = (form: PollutantRegisterForm) => {
  const errors: Partial<Record<keyof PollutantRegisterForm, string>> = {};

  // 가이드에 없는 물질은 만들 수 없으므로 서버가 catalogId 를 필수(@NotNull)로 본다.
  // 표기명은 비워 두면 가이드의 표준 국문명이 복사되므로 필수가 아니다.
  if (!form.catalogId) errors.catalogId = "측정물질을 선택해주세요.";
  // 측정방법은 가이드가 정하지 않고 고객사가 정한다 — 서버가 @NotNull 로 본다.
  if (!form.methodId) errors.methodId = "측정방법을 선택해주세요.";
  const minutes = form.samplingMinutes.trim();
  if (minutes && !/^\d+$/.test(minutes)) errors.samplingMinutes = "채취시간은 0 이상의 정수(분)로 입력해주세요.";

  return errors;
};
