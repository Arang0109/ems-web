import { useState } from "react";

import type { ScheduleDetail, ScheduleItemUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toScheduleDetail, toUpdateItemRequest } from "../api/mapper";

export const useUpdateItemAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이 회차 문서에 담긴 측정항목 하나의 측정 조건을 바로잡는다. 같은 항목의 실험분석정보가
  // 있으면 서버가 판정 근거(허용기준·산소보정)를 함께 맞추며, 최신 상세(도메인)를 반환한다.
  const updateItem = async (
    id: number, pollutantId: number, item: ScheduleItemUpdate,
  ): Promise<ScheduleDetail> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.updateItem(id, pollutantId, toUpdateItemRequest(item));
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

  return { updateItem, isLoading, error };
};
