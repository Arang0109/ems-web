import type { TenantProvisionRequest, TenantResponse } from "./dto";
import type { TenantStatus, SubscriptionPlan } from "@shared/model";

import type { Tenant, TenantProvision } from "../model/types";

// 응답 DTO → 도메인 (status·plan 코드를 도메인 유니온으로 좁힘)
export const toTenant = (res: TenantResponse): Tenant => ({
  tenantId: res.tenantId,
  name: res.name,
  bizNumber: res.bizNumber,
  status: res.status as TenantStatus,
  subscriptionPlan: res.subscriptionPlan as SubscriptionPlan,
  createdAt: res.createdAt,
  modifiedAt: res.modifiedAt,
})

// 도메인 입력 → 발급 요청 DTO (passthrough)
export const toProvisionRequest = (vo: TenantProvision): TenantProvisionRequest => ({
  name: vo.name,
  bizNumber: vo.bizNumber,
  subscriptionPlan: vo.subscriptionPlan,
  admin: {
    username: vo.admin.username,
    password: vo.admin.password,
    name: vo.admin.name,
    department: vo.admin.department,
    email: vo.admin.email,
    tel: vo.admin.tel,
  },
})
