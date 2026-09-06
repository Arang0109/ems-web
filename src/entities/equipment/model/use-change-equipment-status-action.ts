import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { EquipmentStatusChange } from "./types";
import { equipmentApi } from "../api/api";
import { toStatusChangeRequest } from "../api/mapper";

export const useChangeEquipmentStatusAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: string, data: EquipmentStatusChange) => {
    const payload = toStatusChangeRequest(data);

    unwrapMessage(await equipmentApi.changeEquipmentStatus(id, payload));
  });

  return { changeEquipmentStatus: run, isLoading, error };
};
