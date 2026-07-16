import type { ClientRegisterForm } from "./types";

export const validateClientFields = (form: ClientRegisterForm) => {
  const errors: Partial<Record<keyof ClientRegisterForm, string>> = {};

  if (!form.name.trim()) {
    errors.name = "기관명을 입력해주세요.";
  }

  if (form.bizNumber && !/^\d{10}$/.test(form.bizNumber)) {
    errors.bizNumber = "10자리의 사업자번호를 입력해주세요.";
  }

  return errors;
};