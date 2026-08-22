import { useState } from "react";

import type { ScheduleDetail, ScheduleMetaUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toUpdateScheduleRequest, toScheduleDetail } from "../api/mapper";

export const useUpdateScheduleAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 계획의 메타(관리번호·채취일자·측정용도)를 수정한다.
  // 서버가 문서 스냅샷의 기본정보까지 같은 값으로 맞춰 주므로, 최신 상세 하나로 화면 전체가 갱신된다.
  const updateSchedule = async (id: number, meta: ScheduleMetaUpdate): Promise<ScheduleDetail> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.updateSchedule(id, toUpdateScheduleRequest(meta));
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

  return { updateSchedule, isLoading, error };
};
