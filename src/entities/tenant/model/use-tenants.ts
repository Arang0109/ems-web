import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";

import { tenantApi } from "../api/api";
import { toTenant } from "../api/mapper";
import type { Tenant } from "./types";

/** 타입 A(자동 로드): 고객사 목록(플랫폼 운영자용). */
export const useTenants = () =>
  useFetch<Tenant[]>(
    async () => unwrapMessage(await tenantApi.getTenantList()).map(toTenant),
    [],
  );
