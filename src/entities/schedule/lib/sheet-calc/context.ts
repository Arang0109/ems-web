import type { SheetSave } from "../../model/types";
import type { SheetCalcExternals, SheetCalcPointPreview } from "./types";

// 스텝이 순서대로 채워 나가는 누적 컨텍스트 (서버 SheetContext 미러링).
// 각 스텝은 앞 스텝이 채운 값을 읽고 자기 결과를 기록한다.

export type SheetCalcContext = {
  pa: number | null;
  pg: number | null;
  pm_g: number | null;
  xw: number | null;
  tm_g: number | null;
  vm_g: number | null;
  ma: number | null;
  samplingPointCnt: number | null;
  area: number | null;
  o2: number | null;
  co2: number | null;
  co: number | null;
  n2: number | null;
  o2CorrectionFactor: number | null;
  Md: number | null;
  Mw: number | null;
  standardGasDensity: number | null;          // round 2 (표시·저장값)
  gasDensity: number | null;                  // 현장조건 (round 3)
  Cp: number | null;
  Vs: number | null;
  quantity: number | null;
  standardQuantity: number | null;
  avgTg: number | null;
  avgPv: number | null;
  avgPs: number | null;
  avgTm: number | null;
  points: SheetCalcPointPreview[];
  avgKFactor: number | null;
  avgOrificeDp: number | null;
  avgIsokineticRatio: number | null;
  totalVm: number | null;
  totalSamplingTime: number | null;
  // 표시 전용
  pmGInchH2O: number | null;
  noxAvg: number | null;
  soxAvg: number | null;
};

// 스텝 공통 입력 — 시트(폼 값)와 시트 밖 계산 입력
export type SheetCalcInput = {
  sheet: SheetSave;
  ext: SheetCalcExternals;
};

// 모든 스텝의 시그니처. ctx를 제자리에서 채운다(서버 스텝 체인과 동일).
export type SheetCalcStep = (ctx: SheetCalcContext, input: SheetCalcInput) => void;

const emptyPoint = (): SheetCalcPointPreview => ({
  avgTm: null, Vs: null, Vm: null, Vlc: null,
  kFactor: null, orificeDp: null, isokineticRatio: null,
});

// 측정점 미리보기는 폼 배열과 인덱스 1:1이라 개수만큼 미리 채워 둔다.
export const createSheetCalcContext = (pointCount: number): SheetCalcContext => ({
  pa: null, pg: null, pm_g: null,
  xw: null, tm_g: null, vm_g: null, ma: null,
  samplingPointCnt: null, area: null,
  o2: null, co2: null, co: null, n2: null,
  o2CorrectionFactor: null, Md: null, Mw: null,
  standardGasDensity: null, gasDensity: null,
  Cp: null, Vs: null, quantity: null, standardQuantity: null,
  avgTg: null, avgPv: null, avgPs: null, avgTm: null,
  points: Array.from({ length: pointCount }, emptyPoint),
  avgKFactor: null, avgOrificeDp: null, avgIsokineticRatio: null,
  totalVm: null, totalSamplingTime: null,
  pmGInchH2O: null, noxAvg: null, soxAvg: null,
});
