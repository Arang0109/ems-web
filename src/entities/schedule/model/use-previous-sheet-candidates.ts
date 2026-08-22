import { useState, useCallback } from "react";

import type { PreviousSheetCandidate } from "./types";
import { toPreviousSheetCandidates } from "../api/mapper";
import { scheduleApi } from "../api/api";

import type { MeasurementCategory } from "@shared/model";
import { ERROR_MESSAGE } from "@shared/config";

/**
 * 조회 결과. 빈 배열이면서 `errorMessage` 가 null 인 것은 <b>불러올 기록이 없다</b>는 정상 결과다
 * (첫 회차이거나 그 기록지를 처음 쓰는 경우). 호출부가 "없음"과 "실패"에 다르게 반응해야 한다.
 */
export interface PreviousSheetCandidatesResult {
  candidates: PreviousSheetCandidate[];
  errorMessage: string | null;
}

/**
 * 타입 B(수동 호출): 사용자가 "이전 기록 불러오기"를 누를 때만 조회한다.
 *
 * 시트 본문 조회(`usePreviousSheet`)와 나눠 둔다 — 목록은 회차만 보여주면 되고,
 * 후보마다 시트를 함께 받으면 쓰지도 않을 값을 회차 수만큼 끌고 오게 된다.
 *
 * 결과를 반환값으로도 돌려주는 이유는 `usePreviousSheet` 과 같다 — 조회 직후 그 자리에서
 * "없음"을 알리거나 선택 목록을 띄워야 하므로 다음 렌더의 `data` 를 기다릴 수 없다.
 */
export const usePreviousSheetCandidates = () => {
  const [data, setData] = useState<PreviousSheetCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = useCallback(
    async (id: number, category: MeasurementCategory): Promise<PreviousSheetCandidatesResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await scheduleApi.getPreviousSheetCandidates(id, category);
        if (!res.status) {
          const message = res.message ?? ERROR_MESSAGE.FETCH;
          setError(message);
          return { candidates: [], errorMessage: message };
        }

        const candidates = toPreviousSheetCandidates(res.data ?? []);
        setData(candidates);
        return { candidates, errorMessage: null };
      } catch {
        setError(ERROR_MESSAGE.FETCH);
        return { candidates: [], errorMessage: ERROR_MESSAGE.FETCH };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { data, isLoading, error, fetchCandidates };
};
