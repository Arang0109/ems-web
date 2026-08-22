import { useState } from "react";

import { ERROR_MESSAGE } from "@shared/config";

import type { BasicInfoUpdate, ScheduleDetail } from "./types";
import { scheduleApi } from "../api/api";
import { toUpdateBasicInfoRequest, toScheduleDetail } from "../api/mapper";

export const useUpdateBasicInfoAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 기본정보 수정 후 최신 상세(도메인)를 반환한다. 계산 입력이 아니므로 시트는 재계산되지 않는다.
  // 실패는 상태 코드를 지닌 ApiError 로 올라온다 — 호출부가 충돌(409)을 구분할 수 있도록 그대로 던진다.
  const updateBasicInfo = async (
    id: number, basicInfo: BasicInfoUpdate,
  ): Promise<ScheduleDetail> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await scheduleApi.updateBasicInfo(id, toUpdateBasicInfoRequest(basicInfo));
      return toScheduleDetail(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGE.NETWORK;
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateBasicInfo, isLoading, error };
};
