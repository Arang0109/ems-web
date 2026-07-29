// 서버 계약: /platform/tenants (PLATFORM_ADMIN 전용)
// status·subscriptionPlan은 wire에서 문자열 코드로 오간다(도메인 유니온은 model/types.ts).

export type TenantResponse = {
  tenantId: number;
  name: string;               // 고객사명
  bizNumber: string;          // 사업자번호(코드, 숫자만)
  status: string;             // TenantStatus 코드
  subscriptionPlan: string;   // SubscriptionPlan 코드
  createdAt: string;
  modifiedAt: string;
}

// 초기 관리자(ADMIN) 계정 요청
export type TenantAdminRequest = {
  username: string;
  password: string;
  name: string;
  department: string;
  email: string;
  tel: string;
}

// 고객사 발급 요청 — tenant + 초기 관리자 동시 생성
export type TenantProvisionRequest = {
  name: string;
  bizNumber: string;
  subscriptionPlan: string;
  admin: TenantAdminRequest;
}
