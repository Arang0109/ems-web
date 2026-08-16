import type { PollutantUpdateForm } from "./types";

export const validatePollutantUpdateFields = (form: PollutantUpdateForm) => {
  const errors: Partial<Record<keyof PollutantUpdateForm, string>> = {};

  // 서버가 nameKr 만 필수(@NotBlank)로 본다. 나머지는 선택 항목이다.
  if (!form.nameKr.trim()) errors.nameKr = "측정물질명(한글)을 입력해주세요.";

  return errors;
};
