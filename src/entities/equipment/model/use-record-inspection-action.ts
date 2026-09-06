import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { InspectionRecordCreate } from "./types";
import { equipmentApi } from "../api/api";
import { toRecordInspectionRequest } from "../api/mapper";

export const useRecordInspectionAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (equipmentId: string, data: InspectionRecordCreate) => {
    const payload = toRecordInspectionRequest(data);

    unwrapMessage(await equipmentApi.recordInspection(equipmentId, payload));
  });

  return { recordInspection: run, isLoading, error };
};
