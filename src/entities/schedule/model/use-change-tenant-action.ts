import { useEntityMutation } from "@shared/model";
import type { ScheduleDetail, TenantSnapshotUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toChangeTenantRequest, toScheduleDetail } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

export const useChangeTenantAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, tenant: TenantSnapshotUpdate,): Promise<ScheduleDetail> => {
    const response = await scheduleApi.changeTenant(id, toChangeTenantRequest(tenant));
    return toScheduleDetail(response.data);
  }, { invalidateKeys: [scheduleKeys.all] });

  return { changeTenant: run, isLoading, error };
};
