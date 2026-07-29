import type { TenantProvisionForm } from "./types";
import type { TenantProvision, SubscriptionPlan } from "@entities/tenant";

import { unformatNumber, trimValue } from "@shared/lib";

export const toTenantProvision = (
  form: TenantProvisionForm
): TenantProvision => ({
  name: trimValue(form.name),
  bizNumber: unformatNumber(form.bizNumber),         // 코드: 숫자만 정규화
  subscriptionPlan: form.subscriptionPlan as SubscriptionPlan,
  admin: {
    username: trimValue(form.adminUsername),
    password: form.adminPassword,
    name: trimValue(form.adminName),
    department: trimValue(form.adminDepartment),
    email: trimValue(form.adminEmail),
    tel: unformatNumber(form.adminTel),
  },
});
