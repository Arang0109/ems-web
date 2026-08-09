import { useState } from "react";
import type { InspectionRecordCreate } from "./types";
import { equipmentApi } from "../api/api";
import { toRecordInspectionRequest } from "../api/mapper";

export const useRecordInspectionAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordInspection = async (equipmentId: string, data: InspectionRecordCreate) => {
    setIsLoading(true);
    setError(null);

    const payload = toRecordInspectionRequest(data);

    try {
      const result = await equipmentApi.recordInspection(equipmentId, payload);
      if (!result.status) {
        throw new Error(result.message ?? '서버 연결에 실패했습니다.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '서버 연결에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recordInspection,

    isLoading, error,
  }
}
