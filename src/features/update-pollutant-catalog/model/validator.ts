import type { PollutantCatalogUpdateForm } from "./types";

export const validatePollutantCatalogUpdateFields = (form: PollutantCatalogUpdateForm) => {
  const errors: Partial<Record<keyof PollutantCatalogUpdateForm, string>> = {};

  if (!form.nameKr.trim()) errors.nameKr = "측정물질명(한글)을 입력해주세요.";

  if (form.sortOrder.trim() && !/^\d+$/.test(form.sortOrder.trim())) {
    errors.sortOrder = "노출 순서는 0 이상의 정수로 입력해주세요.";
  }

  return errors;
};
