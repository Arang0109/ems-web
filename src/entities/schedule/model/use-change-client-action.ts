import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ScheduleDetail, ClientSnapshotUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toChangeClientRequest, toScheduleDetail } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

export const useChangeClientAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, client: ClientSnapshotUpdate): Promise<ScheduleDetail> => {
    const result = unwrapMessage(await scheduleApi.changeClient(id, toChangeClientRequest(client)));
    return toScheduleDetail(result);
  }, { invalidateKeys: [scheduleKeys.all] });

  return { changeClient: run, isLoading, error };
};
