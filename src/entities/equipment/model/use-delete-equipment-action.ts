import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { equipmentApi } from "../api/api";
import { equipmentKeys } from "./query-keys";

export const useDeleteEquipmentAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: string) => {
    unwrapMessage(await equipmentApi.deleteEquipment(id));
  }, { invalidateKeys: [equipmentKeys.all] });

  return { deleteEquipment: run, isLoading, error };
};
