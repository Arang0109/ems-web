import type { MemberRegisterForm } from "./types";

export const validateMemberFields = (form: MemberRegisterForm) => {
  const errors: Partial<Record<keyof MemberRegisterForm, string>> = {};

  if (!form.username.trim()) {
    errors.username = "아이디를 입력해주세요.";
  }

  if (!form.password.trim()) {
    errors.password = "비밀번호를 입력해주세요.";
  }

  if (!form.name.trim()) {
    errors.name = "이름을 입력해주세요.";
  }

  if (!form.roleId) {
    errors.roleId = "역할을 선택해주세요.";
  }

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }

  return errors;
};
