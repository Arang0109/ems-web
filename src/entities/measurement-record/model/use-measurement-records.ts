import { useState, useEffect, useCallback } from "react";

import type { MeasurementRecord } from "./types";
import { toMeasurementRecords } from "../api/mapper";
import { measurementRecordApi } from "../api/api";

import { ERROR_MESSAGE } from "@shared/config";

/**
 * 타입 A(자동 로드): 측정지점의 측정 이력을 <b>전체 기간</b>으로 조회한다.
 *
 * 서버는 연도 파라미터도 받지만 여기서는 쓰지 않는다 — 이력 화면의 연도 선택지 자체를
 * 데이터에서 뽑아야 하고(연도를 좁혀 받으면 어떤 연도가 있는지 알 수 없다), 추이는 연도 경계를
 * 넘겨 봐야 의미가 있다. 한 측정지점의 이력은 회차 수만큼이라 한 번에 받아도 부담이 없다.
 *
 * `stackId` 가 null 이면 조회하지 않는다. 측정지점을 아직 못 읽은 상태이므로 빈 목록을
 * "이력 없음"으로 보여주면 사실과 다르다 — `isLoading` 을 유지해 구분한다.
 */
export const useMeasurementRecords = (stackId: number | null) => {
  const [data, setData] = useState<MeasurementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  // 측정지점이 바뀌면 이전 지점의 이력을 곧바로 버린다. 렌더 중 초기화라서
  // effect + setState 조합(cascading render)을 만들지 않는다.
  const [prevStackId, setPrevStackId] = useState(stackId);
  if (stackId !== prevStackId) {
    setPrevStackId(stackId);
    setIsLoading(true);
    setError(null);
    setData([]);
  }

  const refetch = useCallback(() => {
    setIsLoading(true);
    setRevision((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (stackId === null) return;

    // 측정지점을 빠르게 바꾸면 늦게 도착한 이전 응답이 새 화면을 덮어쓴다.
    let isStale = false;

    measurementRecordApi
      .getMeasurementRecords(stackId)
      .then((res) => {
        if (isStale) return;
        // 성공 시 직전 조회의 에러를 지운다 — effect 안에서 동기적으로 지우면 cascading render 다.
        if (res.status) { setData(toMeasurementRecords(res.data ?? [])); setError(null); }
        else setError(res.message ?? ERROR_MESSAGE.FETCH);
      })
      .catch(() => { if (!isStale) setError(ERROR_MESSAGE.NETWORK); })
      .finally(() => { if (!isStale) setIsLoading(false); });

    return () => { isStale = true; };
  }, [stackId, revision]);

  return { data, isLoading, error, refetch };
};
