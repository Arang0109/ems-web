import { useState, useCallback } from "react";

import type { PreviousSheet } from "./types";
import { toPreviousSheet } from "../api/mapper";
import { scheduleApi } from "../api/api";

import type { MeasurementCategory } from "@shared/model";
import { ERROR_MESSAGE } from "@shared/config";

/**
 * 조회 결과. `previous` 가 null 이면서 `errorMessage` 도 null 인 것은
 * <b>불러올 기록이 없다</b>는 정상 결과다(첫 회차이거나 그 기록지를 처음 쓰는 경우).
 * 호출부가 "없음"과 "실패"에 다르게 반응해야 해서 둘을 한 값으로 합치지 않는다.
 */
export interface PreviousSheetResult {
  previous: PreviousSheet | null;
  errorMessage: string | null;
}

/**
 * 타입 B(수동 호출): 사용자가 "이전 기록 불러오기"를 누를 때만 조회한다.
 *
 * `sourceScheduleId` 로 어느 회차에서 가져올지 지정한다. 생략하면 가장 최근 회차다.
 * 고를 수 있는 회차는 `usePreviousSheetCandidates` 로 받는다.
 *
 * 결과를 반환값으로도 돌려준다 — 호출부가 조회 직후 확인 다이얼로그에 출처를 실어 보여주고
 * 그 자리에서 폼에 넣어야 하므로, 다음 렌더의 `data` 를 기다리면 흐름이 꼬인다
 * (`useScheduleDetail` 이 값을 함께 반환하는 것과 같은 이유).
 */
export const usePreviousSheet = () => {
  const [data, setData] = useState<PreviousSheet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreviousSheet = useCallback(
    async (
      id: number, category: MeasurementCategory, sourceScheduleId?: number,
    ): Promise<PreviousSheetResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await scheduleApi.getPreviousSheet(id, category, sourceScheduleId);
        if (!res.status) {
          const message = res.message ?? ERROR_MESSAGE.FETCH;
          setError(message);
          return { previous: null, errorMessage: message };
        }

        const previous = toPreviousSheet(res.data);
        setData(previous);
        return { previous, errorMessage: null };
      } catch {
        setError(ERROR_MESSAGE.FETCH);
        return { previous: null, errorMessage: ERROR_MESSAGE.FETCH };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { data, isLoading, error, fetchPreviousSheet };
};
