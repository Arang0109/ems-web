import { useState } from "react";

import type { ScheduleDetail, SheetSave } from "./types";
import { scheduleApi } from "../api/api";
import { toSaveSheetsRequest, toScheduleDetail } from "../api/mapper";

export const useSaveSheetsAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 시트 저장 후 서버 계산결과가 채워진 최신 상세(도메인)를 반환한다.
  const saveSheets = async (id: number, sheets: SheetSave[]): Promise<ScheduleDetail> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.saveSheets(id, toSaveSheetsRequest(sheets));
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

  return { saveSheets, isLoading, error };
};
