import { useState } from "react";
import type { EquipmentUpdate } from "./types";
import { equipmentApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";

export const useUpdateEquipmentAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEquipment = async (id: string, data: EquipmentUpdate) => {
    setIsLoading(true);
    setError(null);

    const payload = toUpdateRequest(data);

    try {
      const result = await equipmentApi.updateEquipment(id, payload);
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
    updateEquipment,

    isLoading, error,
  }
}
