import { useState } from "react";
import type { EquipmentStatusChange } from "./types";
import { equipmentApi } from "../api/api";
import { toStatusChangeRequest } from "../api/mapper";

export const useChangeEquipmentStatusAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeEquipmentStatus = async (id: string, data: EquipmentStatusChange) => {
    setIsLoading(true);
    setError(null);

    const payload = toStatusChangeRequest(data);

    try {
      const result = await equipmentApi.changeEquipmentStatus(id, payload);
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
    changeEquipmentStatus,

    isLoading, error,
  }
}
