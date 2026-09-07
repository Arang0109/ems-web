import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { InspectionRecordCreate } from "./types";
import { equipmentApi } from "../api/api";
import { toRecordInspectionRequest } from "../api/mapper";
import { equipmentKeys } from "./query-keys";

export const useRecordInspectionAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (equipmentId: string, data: InspectionRecordCreate) => {
    const payload = toRecordInspectionRequest(data);

    unwrapMessage(await equipmentApi.recordInspection(equipmentId, payload));
  }, { invalidateKeys: [equipmentKeys.all] });

  return { recordInspection: run, isLoading, error };
};
