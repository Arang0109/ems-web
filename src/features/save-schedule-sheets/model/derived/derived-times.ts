// derived/ — 입력에서 파생하는 표시값. 시각(derived-times)·흡인량 환산(suction)·평균(input-average)·노즐 추천(nozzle-estimate)·
// 단면 거리(wall-distances)·타임라인(sampling-timeline). 폼에 써 넣지 않고 화면·인쇄·타임라인이 같은 함수를 불러 같은 값을
// 보여 준다. 유일한 예외가 입자상 종료시각(withParticleEndTime)인데, 폼에 저장되지만 입력이 아니라 파생값이다.

import type { SheetCalcPreview } from "@entities/schedule";
import { addMinutes, toNumberOrNull } from "@shared/lib";

import type { MoistureForm, SamplingPointForm, SheetForm } from "../types";

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
export const calcGasAnalyzerEndTime = (start: string): string | null =>
  addMinutes(start, GAS_ANALYZER_DURATION_MINUTES);

/** THC 측정 종료시각. 시작이 비었으면 `null`. */
export const calcThcAnalyzerEndTime = (start: string): string | null =>
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

/**
 * 입자상 채취 종료시각 = 시작시각 + Σ지점별 채취시간(분). 시작이 없으면 빈 값.
 * 합산 규칙({@link calcParticleSamplingMinutes})은 타임라인과 공유한다 — 두 곳이 다른 종료시각을 말하면 안 된다.
 */
export const calcParticleEndTime = (start: string, points: SamplingPointForm[]): string =>
  addMinutes(start, calcParticleSamplingMinutes(points)) ?? "";

/**
 * 입자상 종료시각을 다시 계산해 넣은 기록지. 지점 채취시간·지점 수·시작시각이 바뀌는 모든 경로가 이것을 거친다 —
 * 종료시각은 폼에 저장되지만 입력이 아니라 파생값이라, 어느 한 경로가 빠뜨리면 저장된 값이 입력과 어긋난다.
 */
export const withParticleEndTime = (sheet: SheetForm): SheetForm => ({
  ...sheet,
  particle: {
    ...sheet.particle,
    samplingEndTime: calcParticleEndTime(sheet.particle.samplingStartTime, sheet.samplingPoints),
  },
});
