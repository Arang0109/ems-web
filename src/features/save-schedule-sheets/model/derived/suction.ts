/**
 * 흡인량 단위 환산 — 입자상 집계는 m³·분, 가스상 시료 행과 기록지 표는 L·L/min 이다.
 * 등속흡인 행 파생(`gaseous/sample-rules`)과 인쇄 미리보기(`ui/report`)가 같은 식을 쓰도록 한 곳에 둔다.
 * 서버 `IsokineticSampleStep` 과 같은 식이다.
 */

export const LITERS_PER_CUBIC_METER = 1000;

/** m³ → L. 값이 없으면 null */
export const litersOf = (cubicMeters: number | null): number | null =>
  cubicMeters === null ? null : cubicMeters * LITERS_PER_CUBIC_METER;

/** 흡인유량(L/min) = 채취량(L) ÷ 총채취시간(분). 어느 쪽이 없거나 시간이 0이면 정의되지 않는다 */
export const calcSuctionFlowRate = (liters: number | null, minutes: number | null): number | null =>
  liters === null || minutes === null || minutes === 0 ? null : liters / minutes;
