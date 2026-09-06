import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ScheduleDetail, ScheduleEquipmentsUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toChangeEquipmentsRequest, toScheduleDetail } from "../api/mapper";

export const useChangeEquipmentsAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, equipments: ScheduleEquipmentsUpdate,): Promise<ScheduleDetail> => {
    const result = unwrapMessage(await scheduleApi.changeEquipments(id, toChangeEquipmentsRequest(equipments)));
    return toScheduleDetail(result);
  });

  return { changeEquipments: run, isLoading, error };
};
