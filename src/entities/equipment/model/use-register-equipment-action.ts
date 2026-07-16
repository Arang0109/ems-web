import { useState } from "react";
import type { EquipmentCreate } from "./types";
import { equipmentApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";

export const useRegisterEquipmentAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerEquipment = async (data: EquipmentCreate) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterRequest(data);

    try {
      const result = await equipmentApi.registerEquipment(payload);
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
    registerEquipment,

    isLoading, error,
  }
}
