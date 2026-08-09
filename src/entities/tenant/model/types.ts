import type { TenantStatus, SubscriptionPlan } from '@shared/model';

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
