import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { TenantProvision } from "./types";
import { tenantApi } from "../api/api";
import { toProvisionRequest } from "../api/mapper";
import { tenantKeys } from "./query-keys";

export const useProvisionTenantAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data: TenantProvision) => {
    const payload = toProvisionRequest(data);

    unwrapMessage(await tenantApi.provisionTenant(payload));
  }, { invalidateKeys: [tenantKeys.all] });

  return { provisionTenant: run, isLoading, error };
};
