import { useState } from "react";

import type { ScheduleDetail, ScheduleEquipmentsUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toChangeEquipmentsRequest, toScheduleDetail } from "../api/mapper";

export const useChangeEquipmentsAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 장비 교체 후 서버가 시트를 재계산한 최신 상세(도메인)를 반환한다.
  const changeEquipments = async (
    id: number, equipments: ScheduleEquipmentsUpdate,
  ): Promise<ScheduleDetail> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.changeEquipments(id, toChangeEquipmentsRequest(equipments));
      if (!result.status) {
        throw new Error(result.message ?? "서버 연결에 실패했습니다.");
      }
      return toScheduleDetail(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "서버 연결에 실패했습니다.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { changeEquipments, isLoading, error };
};
