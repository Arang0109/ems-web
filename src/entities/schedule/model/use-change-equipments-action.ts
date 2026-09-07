import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ScheduleDetail, ScheduleEquipmentsUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toChangeEquipmentsRequest, toScheduleDetail } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

export const useChangeEquipmentsAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, equipments: ScheduleEquipmentsUpdate,): Promise<ScheduleDetail> => {
    const result = unwrapMessage(await scheduleApi.changeEquipments(id, toChangeEquipmentsRequest(equipments)));
    return toScheduleDetail(result);
  }, { invalidateKeys: [scheduleKeys.all] });

  return { changeEquipments: run, isLoading, error };
};
