import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { EquipmentCreate } from "./types";
import { equipmentApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";

export const useRegisterEquipmentAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (data: EquipmentCreate) => {
    const payload = toRegisterRequest(data);

    unwrapMessage(await equipmentApi.registerEquipment(payload));
  });

  return { registerEquipment: run, isLoading, error };
};
