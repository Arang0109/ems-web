import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";

import { measurementRecordApi } from "../api/api";
import { toMeasurementRecords } from "../api/mapper";
import type { MeasurementRecord } from "./types";

/**
 * 타입 A(자동 로드): 측정지점의 측정 이력을 <b>전체 기간</b>으로 조회한다.
 *
 * 서버는 연도 파라미터도 받지만 여기서는 쓰지 않는다 — 이력 화면의 연도 선택지 자체를
 * 데이터에서 뽑아야 하고(연도를 좁혀 받으면 어떤 연도가 있는지 알 수 없다), 추이는 연도 경계를
 * 넘겨 봐야 의미가 있다. 한 측정지점의 이력은 회차 수만큼이라 한 번에 받아도 부담이 없다.
 */
export const useMeasurementRecords = (stackId: number | null) => {
  const result = useFetch<MeasurementRecord[]>(
    async () => toMeasurementRecords(unwrapMessage(await measurementRecordApi.getMeasurementRecords(stackId as number)) ?? []),
    [],
    { deps: [stackId], enabled: stackId !== null, resetOnChange: true },
  );

  // 측정지점을 아직 못 읽은 상태에서 빈 목록을 "이력 없음"으로 보여주면 사실과 다르다 —
  // 대기 중임을 유지해 구분한다. 다른 조회 훅과 달리 여기만 이 구분이 화면에 드러난다.
  return { ...result, isLoading: result.isLoading || stackId === null };
};
