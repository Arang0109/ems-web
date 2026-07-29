import { useState } from "react";

import type { BasicInfoUpdate, ScheduleDetail } from "./types";
import { scheduleApi } from "../api/api";
import { toUpdateBasicInfoRequest, toScheduleDetail } from "../api/mapper";

export const useUpdateBasicInfoAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 기본정보 수정 후 최신 상세(도메인)를 반환한다. 계산 입력이 아니므로 시트는 재계산되지 않는다.
  const updateBasicInfo = async (
    id: number, basicInfo: BasicInfoUpdate,
  ): Promise<ScheduleDetail> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.updateBasicInfo(id, toUpdateBasicInfoRequest(basicInfo));
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

  return { updateBasicInfo, isLoading, error };
};
