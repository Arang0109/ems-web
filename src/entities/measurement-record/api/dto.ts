import type { MeasurementCycle } from "@shared/model";

/**
 * 측정지점 이력 목록 — GET /measurement-records?stackId=&year=
 *
 * <b>완료된</b> 측정계획의 항목별 기록을 측정일 내림차순으로 준다. 한 회차에서 여러 항목을
 * 측정하므로 같은 `scheduleId` 가 연달아 나온다 — 화면은 회차 단위로 묶어 읽는다.
 * `year` 를 주지 않으면 전체 기간이다.
 *
 * 측정 결과(농도·배출량 등)는 기록만 있고 값이 아직 없는 회차가 있어 모두 nullable 이다.
 * `periodKey`·`periodLabel` 은 저장값이 아니라 주기에서 파생한 구간 표기다(예: "2026-Q1", "1분기").
 */
export type MeasurementRecordListResponse = {
  recordId: number;
  scheduleId: number;
  sampledAt: string;                        // LocalDate "yyyy-MM-dd"
  pollutantId: number;
  /** 모든 고객사에서 동일한 전역 측정물질 키(예: `NOX`) */
  code: string;
  nameKr: string;
  cycle: MeasurementCycle;
  periodKey: string | null;
  periodLabel: string | null;
  concentration: number | null;
  unit: string | null;
  correctedConcentration: number | null;
  emission: number | null;
  allowance: number | null;
  /** 허용기준 초과 여부. 기준이나 측정값이 없으면 null 이라 "초과 아님"과 구분된다 */
  exceeded: boolean | null;
};
