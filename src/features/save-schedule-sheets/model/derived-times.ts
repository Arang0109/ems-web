import type { SheetCalcPreview } from "@entities/schedule";
import { addMinutes, toNumberOrNull } from "@shared/lib";

import type { MoistureForm, SamplingPointForm } from "./types";

/**
 * 입력받지 않고 계산으로 얻는 시각·지속시간.
 *
 * 측정 데이터 입력 폼에는 종료시각 입력칸이 없는 항목이 여럿이다 — 규정상 측정시간이
 * 고정이거나(가스분석기·THC), 다른 입력에서 유도되기 때문이다(수분·입자상).
 * 그 규칙을 여기 한 곳에 모아 입력 화면·인쇄 미리보기·타임라인이 같은 값을 쓰게 한다.
 */

/** 가스분석기 측정은 시작 후 15분 고정 (서버 `ExhaustGasData` 주석과 같은 규약) */
export const GAS_ANALYZER_DURATION_MINUTES = 15;

/** THC 분석기 측정은 시작 후 30분 고정 */
export const THC_ANALYZER_DURATION_MINUTES = 30;

/** 가스분석기 측정 종료시각. 시작이 비었으면 `null` — 표시용 대체값은 호출부가 정한다. */
export const getGasAnalyzerEndTime = (start: string): string | null =>
  addMinutes(start, GAS_ANALYZER_DURATION_MINUTES);

/** THC 측정 종료시각. 시작이 비었으면 `null`. */
export const getThcAnalyzerEndTime = (start: string): string | null =>
  addMinutes(start, THC_ANALYZER_DURATION_MINUTES);

/**
 * 입자상 총 채취시간(분) — 지점별 채취시간의 합.
 * 채취 종료시각은 채취 시작시각 + 이 값이다.
 */
export const calcParticleSamplingMinutes = (points: SamplingPointForm[]): number =>
  points.reduce((acc, p) => acc + (toNumberOrNull(p.samplingTime) ?? 0), 0);

/**
 * 수분 채취시간(분) = 흡입 건조가스량(Vm, L) ÷ 흡인유속(L/min).
 *
 * 수분에 종료시각 입력칸이 없는 이유가 이 식이다 — 계산으로 구할 수 있어 폼에서 뺐다.
 * 흡인량이 아직 계산되지 않았거나 유속이 없으면(0 포함) `null`.
 */
export const calcMoistureSamplingMinutes = (
  moisture: MoistureForm,
  preview: SheetCalcPreview | null,
): number | null => {
  const volume = preview?.moisture.vm_g ?? null;
  const velocity = toNumberOrNull(moisture.suctionVelocity);

  if (volume == null || velocity == null || velocity === 0) return null;
  return volume / velocity;
};
