import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ScheduleDetail, ClientSnapshotUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toChangeClientRequest, toScheduleDetail } from "../api/mapper";

export const useChangeClientAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, client: ClientSnapshotUpdate): Promise<ScheduleDetail> => {
    const result = unwrapMessage(await scheduleApi.changeClient(id, toChangeClientRequest(client)));
    return toScheduleDetail(result);
  });

  return { changeClient: run, isLoading, error };
};
