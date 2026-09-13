import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { EquipmentStatusChange } from "./types";
import { equipmentApi } from "../api/api";
import { toStatusChangeRequest } from "../api/mapper";
import { equipmentKeys } from "./query-keys";

export const useChangeEquipmentStatusAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: string, data: EquipmentStatusChange) => {
    const payload = toStatusChangeRequest(data);

    unwrapMessage(await equipmentApi.changeEquipmentStatus(id, payload));
  }, { invalidateKeys: [equipmentKeys.all] });

  return { changeEquipmentStatus: run, isLoading, error };
};
