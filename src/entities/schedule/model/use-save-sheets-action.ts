import { useState } from "react";

import { ERROR_MESSAGE } from "@shared/config";

import type { ScheduleDetail, SheetSave, SheetRef } from "./types";
import { scheduleApi } from "../api/api";
import { toSaveSheetsRequest, toScheduleDetail } from "../api/mapper";

export const useSaveSheetsAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 서버는 요청에 담긴 시트만 교체하므로 삭제는 deletedSheets 로 명시한다.
  // 실패는 상태 코드를 지닌 ApiError 로 올라온다(충돌 409 구분이 필요해서다) — 그대로 던진다.
  const saveSheets = async (
    id: number, sheets: SheetSave[], deletedSheets: SheetRef[] = [],
  ): Promise<ScheduleDetail> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await scheduleApi.saveSheets(id, toSaveSheetsRequest(sheets, deletedSheets));
      return toScheduleDetail(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGE.NETWORK;
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { saveSheets, isLoading, error };
};
