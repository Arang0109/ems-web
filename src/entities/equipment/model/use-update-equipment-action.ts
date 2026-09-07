import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { EquipmentUpdate } from "./types";
import { equipmentApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";
import { equipmentKeys } from "./query-keys";

export const useUpdateEquipmentAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: string, data: EquipmentUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await equipmentApi.updateEquipment(id, payload));
  }, { invalidateKeys: [equipmentKeys.all] });

  return { updateEquipment: run, isLoading, error };
};
