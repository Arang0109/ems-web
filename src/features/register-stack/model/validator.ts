import type { StackRegisterForm } from "./types";

export const validateStackFields = (form: StackRegisterForm) => {
  const errors: Partial<Record<keyof StackRegisterForm, string>> = {};

  if (!form.stackName.trim()) {
    errors.stackName = "측정시설명을 입력해주세요.";
  }

  // 기준산소농도는 선택 항목이라 빈 값은 통과시킨다(= 미지정).
  // 입력했다면 정수 0~21만 허용한다 — 서버 계약이 Integer라 소수는 잘리고,
  // 대기 중 산소농도가 20.9%라 21 초과는 물리적으로 의미가 없다.
  const standardOxygen = form.standardOxygen.trim();
  if (standardOxygen) {
    const value = Number(standardOxygen);
    if (!Number.isInteger(value) || value < 0 || value > 21) {
      errors.standardOxygen = "0~21 사이 정수로 입력해주세요.";
    }
  }

  return errors;
};
