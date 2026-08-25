import { useState } from "react";

import type { ScheduleDetail } from "./types";
import { scheduleApi } from "../api/api";
import { toScheduleDetail } from "../api/mapper";

/**
 * 성적서에 실릴 측정항목의 순서 변경.
 *
 * `orderedPollutantIds` 는 이 계획의 측정항목 **전체**여야 하며, 배열 순서가 곧 성적서 표기 순서다.
 * 기록부 서식은 한 장에 실리는 항목 수가 정해져 있어(대기측정기록부 4개) 이 순서가 몇 번째 항목이
 * 몇 번째 장에 들어갈지를 결정한다. 집합이 서버와 다르면(내가 화면을 연 뒤 누군가 항목을
 * 교체했다면) 서버가 저장을 거절한다.
 */
export const useReorderItemsAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reorderItems = async (id: number, orderedPollutantIds: number[]): Promise<ScheduleDetail> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.reorderItems(id, { orderedPollutantIds });
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

  return { reorderItems, isLoading, error };
};
