import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { tenantApi } from "../api/api";
import { toTenant } from "../api/mapper";
import { tenantKeys } from "./query-keys";
import type { Tenant } from "./types";

/** 고객사 목록(플랫폼 운영자용). */
export const useTenants = () =>
  useEntityQuery<Tenant[]>({
    queryKey: tenantKeys.list(),
    queryFn: async () => unwrapMessage(await tenantApi.getTenantList()).map(toTenant),
    initialData: [],
  });
