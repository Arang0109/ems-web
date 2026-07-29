import { useState } from "react";
import type { TenantProvision } from "./types";
import { tenantApi } from "../api/api";
import { toProvisionRequest } from "../api/mapper";

export const useProvisionTenantAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provisionTenant = async (data: TenantProvision) => {
    setIsLoading(true);
    setError(null);

    const payload = toProvisionRequest(data);

    try {
      const result = await tenantApi.provisionTenant(payload);
      if (!result.status) {
        throw new Error(result.message ?? '서버 연결에 실패했습니다.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '서버 연결에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    provisionTenant,

    isLoading, error,
  }
}
