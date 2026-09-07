import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { EquipmentCreate } from "./types";
import { equipmentApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";
import { equipmentKeys } from "./query-keys";

export const useRegisterEquipmentAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data: EquipmentCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await equipmentApi.registerEquipment(payload));
  }, { invalidateKeys: [equipmentKeys.all] });

  return { registerEquipment: run, isLoading, error };
};
