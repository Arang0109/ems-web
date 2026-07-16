import { useState } from "react";
import { equipmentApi } from "../api/api";

export const useDeleteEquipmentAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteEquipment = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await equipmentApi.deleteEquipment(id);
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
    deleteEquipment,

    isLoading, error,
  }
}
