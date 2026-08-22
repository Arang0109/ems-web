import { useState } from "react";

import type { ScheduleDetail, ScheduleItemsUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toChangeItemsRequest, toScheduleDetail } from "../api/mapper";

export const useChangeItemsAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이번 계획에서 측정할 항목을 전체 교체한다. 이미 포함돼 있던 항목은 서버가
  // 측정 시점 값(허용기준 등)을 유지하며, 최신 상세(도메인)를 반환한다.
  const changeItems = async (id: number, items: ScheduleItemsUpdate): Promise<ScheduleDetail> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.changeItems(id, toChangeItemsRequest(items));
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

  return { changeItems, isLoading, error };
};
