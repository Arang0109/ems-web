import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { TenantProvision } from "./types";
import { tenantApi } from "../api/api";
import { toProvisionRequest } from "../api/mapper";

export const useProvisionTenantAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (data: TenantProvision) => {
    const payload = toProvisionRequest(data);

    unwrapMessage(await tenantApi.provisionTenant(payload));
  });

  return { provisionTenant: run, isLoading, error };
};
