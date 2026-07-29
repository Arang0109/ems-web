// 고객사(tenant) 상태 — 서버 global/common/enums 의 TenantStatus 와 합의
export const TENANT_STATUS = ['ACTIVE', 'SUSPENDED', 'INACTIVE', 'PENDING'] as const;
export type TenantStatus = (typeof TENANT_STATUS)[number];
export const TENANT_STATUS_LABEL: Record<TenantStatus, string> = {
  ACTIVE: '운영중',
  SUSPENDED: '정지',
  INACTIVE: '비활성',
  PENDING: '대기',
};

// 구독 요금제 — 서버 global/common/enums 의 SubscriptionPlan 실제 값과 일치.
// INTERNAL은 개발·테스트 전용이라 발급 폼에는 노출하지 않지만(SUBSCRIPTION_PLAN_OPTIONS),
// 조회 시 서버가 반환할 수 있으므로 union·라벨맵에는 포함한다.
export const SUBSCRIPTION_PLAN = ['BASIC', 'PRO', 'ENTERPRISE', 'INTERNAL'] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLAN)[number];
export const SUBSCRIPTION_PLAN_LABEL: Record<SubscriptionPlan, string> = {
  BASIC: '베이직',
  PRO: '프로',
  ENTERPRISE: '엔터프라이즈',
  INTERNAL: '내부용',
};

// 발급 폼에서 선택 가능한 요금제 (INTERNAL 제외)
export const SUBSCRIPTION_PLAN_OPTIONS = ['BASIC', 'PRO', 'ENTERPRISE'] as const satisfies readonly SubscriptionPlan[];

// 조회 도메인 모델
export type Tenant = {
  tenantId: number;
  name: string;
  bizNumber: string;
  status: TenantStatus;
  subscriptionPlan: SubscriptionPlan;
  createdAt: string;
  modifiedAt: string;
}

// 초기 관리자 계정 입력 도메인 모델
export type TenantAdminCreate = {
  username: string;
  password: string;
  name: string;
  department: string;
  email: string;
  tel: string;
}

// 고객사 발급 입력 도메인 모델(tenant + 초기 관리자)
export type TenantProvision = {
  name: string;
  bizNumber: string;
  subscriptionPlan: SubscriptionPlan;
  admin: TenantAdminCreate;
}
