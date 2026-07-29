export type TenantProvisionForm = {
  // 고객사 정보
  name: string;
  bizNumber: string;
  subscriptionPlan: string;   // Select 값 (string)

  // 초기 관리자 계정
  adminUsername: string;
  adminPassword: string;
  adminName: string;
  adminDepartment: string;
  adminEmail: string;
  adminTel: string;
}

export const getDefaultForm = (): TenantProvisionForm => ({
  name: "",
  bizNumber: "",
  subscriptionPlan: "",

  adminUsername: "",
  adminPassword: "",
  adminName: "",
  adminDepartment: "",
  adminEmail: "",
  adminTel: "",
});
