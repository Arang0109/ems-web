import type { TenantProvisionForm } from "./types";

export const validateTenantFields = (form: TenantProvisionForm) => {
  const errors: Partial<Record<keyof TenantProvisionForm, string>> = {};

  // 고객사 정보
  if (!form.name.trim()) {
    errors.name = "고객사명을 입력해주세요.";
  }

  if (form.bizNumber && !/^\d{10}$/.test(form.bizNumber)) {
    errors.bizNumber = "10자리의 사업자번호를 입력해주세요.";
  }

  if (!form.subscriptionPlan) {
    errors.subscriptionPlan = "요금제를 선택해주세요.";
  }

  // 초기 관리자 계정
  if (!form.adminUsername.trim()) {
    errors.adminUsername = "관리자 아이디를 입력해주세요.";
  }

  if (!form.adminPassword.trim()) {
    errors.adminPassword = "관리자 비밀번호를 입력해주세요.";
  }

  if (!form.adminName.trim()) {
    errors.adminName = "관리자 이름을 입력해주세요.";
  }

  if (form.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) {
    errors.adminEmail = "올바른 이메일 형식이 아닙니다.";
  }

  return errors;
};
