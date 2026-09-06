import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { equipmentApi } from "../api/api";

export const useDeleteEquipmentAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: string) => {
    unwrapMessage(await equipmentApi.deleteEquipment(id));
  });

  return { deleteEquipment: run, isLoading, error };
};
