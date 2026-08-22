import type { PollutantCatalogRegisterForm } from "./types";

/** 서버 `CreatePollutantCatalogRequest` 의 `@Pattern` 과 같은 규격 */
const CODE_PATTERN = /^[A-Z][A-Z0-9_]{0,29}$/;

export const validatePollutantCatalogRegisterFields = (form: PollutantCatalogRegisterForm) => {
  const errors: Partial<Record<keyof PollutantCatalogRegisterForm, string>> = {};

  // code 는 등록 후 변경할 수 없다 — 서버가 거절하기 전에 여기서 먼저 막는다.
  const code = form.code.trim().toUpperCase();
  if (!code) errors.code = "코드를 입력해주세요.";
  else if (!CODE_PATTERN.test(code)) {
    errors.code = "코드는 대문자로 시작하는 1~30자의 대문자·숫자·밑줄 조합이어야 합니다.";
  }

  if (!form.nameKr.trim()) errors.nameKr = "측정물질명(한글)을 입력해주세요.";

  if (form.sortOrder.trim() && !/^\d+$/.test(form.sortOrder.trim())) {
    errors.sortOrder = "노출 순서는 0 이상의 정수로 입력해주세요.";
  }

  return errors;
};
