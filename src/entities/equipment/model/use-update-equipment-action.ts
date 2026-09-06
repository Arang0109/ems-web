import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { EquipmentUpdate } from "./types";
import { equipmentApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";

export const useUpdateEquipmentAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: string, data: EquipmentUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await equipmentApi.updateEquipment(id, payload));
  });

  return { updateEquipment: run, isLoading, error };
};
