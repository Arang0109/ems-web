import type { MeasurementItemSnapshot, SheetCalcPreview } from "@entities/schedule";
import { particulateSourceOf } from "@entities/schedule";
import { MINUTES_PER_DAY, addMinutes, roundHalfUp, toMinutes, toNumberOrNull } from "@shared/lib";
import type { MeasurementCategory } from "@shared/model";

import { calcSuctionFlowRate, litersOf } from "../derived/suction";
import type { SampleFieldKey, SampleForm, SheetForm } from "../types";

/**
 * 가스상 시료 행의 파생 규칙 — 행이 담은 항목(`pollutantIds`)에서 유도되는 두 가지.
 *
 * 1. **등속흡인 행** — 카탈로그 측정방식이 먼지·중금속·수은인 항목(비소화합물 흡수액)이 담긴 병은
 *    등속흡인 트레인의 병이라, 채취시각·흡인유량·채취량이 입력값이 아니라 같은 기록지 입자상 집계의
 *    사본이다. 서버(`IsokineticSampleStep`)가 저장할 때마다 덮어쓰므로 화면은 그 칸을 잠그고, 폼 값 대신
 *    입력에서 실시간 파생한 값을 보여 준다({@link calcIsokineticDisplay}) — 행을 지웠다 다시 넣어도 값이 보여야 한다.
 *    그런 행은 **그 방식의 입자상 기록지에만** 놓인다(비소는 중금속 기록지에만). 출처가 같은 기록지여야 하고
 *    서버(`requireIsokineticRowsOnSourceSheet`)도 거부하므로, 미배정 목록도 기록지별로 거른다.
 * 2. **종료시각 기본값** — 정유량 행은 시작시각 + 항목의 표준 채취시간(`items[].samplingMinutes`)이 종료시각이다.
 *    서버(`SamplingEndTimeStep`)도 빈 종료시각을 같은 식으로 채우지만, 시작시각을 고칠 때 즉시 따라오게 하는 것은
 *    화면 몫이다 — 서버는 "새 행"과 "사용자가 지운 칸"을 구분할 수 없다.
 *
 * 판정 기준이 서버와 같아야 하므로 규칙을 여기 한 곳에 모은다.
 */
export type SampleRule = {
  /** 등속흡인 항목이면 그 입자상 기록지의 카테고리, 아니면 null */
  particulateSource: MeasurementCategory | null;
  samplingMinutes: number | null;
};

export type SampleRules = ReadonlyMap<number, SampleRule>;

// 항목 mode → 입자상 기록지 매핑은 성적서 탭(save-schedule-analysis)도 쓰므로 entities/schedule/lib 에 있다.
// 이 슬라이스 안의 소비처(gaseous-rows)가 여기서 가져가던 이름을 그대로 유지한다.
export { isIsokineticMode, particulateSourceOf } from "@entities/schedule";

/** 등속흡인 행에서 서버가 입자상 집계로 덮어쓰는 칸 — 화면에서는 잠그고 파생값을 보여 준다 */
export const ISOKINETIC_DERIVED_FIELDS: readonly SampleFieldKey[] = [
  "startTime", "endTime", "suctionQuantity", "beforeVolume", "afterVolume", "samplingVolume",
];

export const buildSampleRules = (items: MeasurementItemSnapshot[]): SampleRules =>
  new Map(items.map((item) => [
    item.pollutantId,
    { particulateSource: particulateSourceOf(item.mode), samplingMinutes: item.samplingMinutes },
  ]));

/** 행에 담긴 등속흡인 항목의 입자상 출처. 등속흡인 항목이 하나라도 담긴 병은 등속흡인 트레인의 병이다 (서버와 같은 판정) */
export const getParticulateSource = (pollutantIds: number[], rules: SampleRules): MeasurementCategory | null => {
  for (const id of pollutantIds) {
    const source = rules.get(id)?.particulateSource ?? null;
    if (source !== null) return source;
  }
  return null;
};

export const isIsokineticSample = (pollutantIds: number[], rules: SampleRules): boolean =>
  getParticulateSource(pollutantIds, rules) !== null;

/** 이 항목들이 이 기록지에 놓일 수 있는가 — 등속흡인 항목은 그 방식의 입자상 기록지에만 */
export const isAllowedOnSheet = (
  pollutantIds: number[], category: MeasurementCategory, rules: SampleRules,
): boolean => {
  const source = getParticulateSource(pollutantIds, rules);
  return source === null || source === category;
};

/** 이 칸이 등속흡인 행의 파생 칸이라 입력을 받지 않는가 */
export const isLockedSampleField = (
  field: SampleFieldKey, pollutantIds: number[], rules: SampleRules,
): boolean =>
  ISOKINETIC_DERIVED_FIELDS.includes(field) && isIsokineticSample(pollutantIds, rules);

/** 행에 담긴 항목들의 표준 채취시간(분). 한 병에 담긴 항목은 채취시간이 같으므로 처음 만나는 값을 쓴다 */
export const getSampleSamplingMinutes = (pollutantIds: number[], rules: SampleRules): number | null => {
  for (const id of pollutantIds) {
    const minutes = rules.get(id)?.samplingMinutes;
    if (minutes != null) return minutes;
  }
  return null;
};

/**
 * 정유량 행의 종료시각 = 시작시각 + 표준 채취시간.
 * 시작이 비었거나, 채취시간이 없거나, 등속흡인 행(시각이 입자상 사본)이면 `null` — 호출부가 기존 값을 유지한다.
 */
export const calcSampleEndTime = (
  start: string, pollutantIds: number[], rules: SampleRules,
): string | null => {
  if (isIsokineticSample(pollutantIds, rules)) return null;
  const minutes = getSampleSamplingMinutes(pollutantIds, rules);
  return minutes === null ? null : addMinutes(start, minutes);
};

/**
 * 행에 patch 를 적용하고, 시작시각이 바뀌었으면 종료시각을 시작 + 표준 채취시간으로 따라 움직인다 —
 * 입자상 섹션의 `withParticleEndTime` 과 같은 규약. 채취시간이 없는 항목·등속흡인 행(시각이 입자상 사본)은
 * {@link calcSampleEndTime} 이 null 을 주므로 기존 종료시각을 둔다.
 */
export const withSampleEndTime = (
  sample: SampleForm, patch: Partial<SampleForm>, rules: SampleRules,
): SampleForm => {
  const next = { ...sample, ...patch };
  if (!("startTime" in patch)) return next;
  const endTime = calcSampleEndTime(next.startTime, next.pollutantIds, rules);
  return endTime === null ? next : { ...next, endTime };
};

/** 채취시간(분) = 종료 − 시작. 자정을 넘기면 하루를 더한다. 둘 중 하나가 비었거나 0분이면 `null` */
export const calcSampleDurationMinutes = (start: string, end: string): number | null => {
  const from = toMinutes(start);
  const to = toMinutes(end);
  if (from === null || to === null) return null;
  const minutes = (to - from + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return minutes === 0 ? null : minutes;
};

/** 시료채취량 소수 자릿수 — 입력칸(`GaseousSection` samplingVolume, maxDecimals 1)·서버 `SamplingVolumeStep` 과 같다 */
const SAMPLE_VOLUME_DECIMALS = 1;

/**
 * 정유량 행의 시료채취량(L) = 채취시간(분) × 흡인유량(L/min).
 * 시각·유량 중 하나라도 없거나, 등속흡인 행(채취량이 입자상 Vm 의 사본)이면 `null` — 호출부가 기존 값을 유지한다.
 */
export const calcSampleVolume = (sample: SampleForm, rules: SampleRules): string | null => {
  if (isIsokineticSample(sample.pollutantIds, rules)) return null;
  const minutes = calcSampleDurationMinutes(sample.startTime, sample.endTime);
  const flowRate = toNumberOrNull(sample.suctionQuantity);
  if (minutes === null || flowRate === null) return null;
  return String(roundHalfUp(minutes * flowRate, SAMPLE_VOLUME_DECIMALS));
};

/** 시료채취량을 결정하는 입력 — 이 중 하나가 바뀌면 채취량을 다시 계산한다 */
const SAMPLE_VOLUME_INPUTS: readonly (keyof SampleForm)[] = ["startTime", "endTime", "suctionQuantity"];

/** 채취시간·흡인유량이 바뀌었으면 시료채취량을 다시 계산해 넣는다. 계산할 수 없으면 적힌 값을 둔다 */
export const withSampleVolume = (
  sample: SampleForm, patch: Partial<SampleForm>, rules: SampleRules,
): SampleForm => {
  if (!SAMPLE_VOLUME_INPUTS.some((key) => key in patch)) return sample;
  const samplingVolume = calcSampleVolume(sample, rules);
  return samplingVolume === null ? sample : { ...sample, samplingVolume };
};

/**
 * 행에 patch 를 적용하고 딸린 파생값을 순서대로 맞춘다 — 시작시각 → 종료시각 → 시료채취량.
 * 종료시각이 먼저인 것은 채취량이 종료시각을 읽기 때문이다. 화면의 모든 행 편집이 이 하나를 지난다.
 */
export const applySamplePatch = (
  sample: SampleForm, patch: Partial<SampleForm>, rules: SampleRules,
): SampleForm =>
  withSampleVolume(withSampleEndTime(sample, patch, rules), patch, rules);

/** 등속흡인 행에 표시할 파생값 — 잠긴 칸의 값이며 폼 값을 대신한다 */
export type IsokineticDisplay = Pick<SampleForm, "startTime" | "endTime" | "suctionQuantity" | "beforeVolume" | "afterVolume" | "samplingVolume">;

/** 서버(`Calculator.round(…, 2)`)와 같은 자릿수. 폼 문자열이라 불필요한 0은 붙이지 않는다 */
const toFormNumber = (value: number | null): string =>
  value === null || !Number.isFinite(value) ? "" : String(Math.round(value * 100) / 100);

/** m³ 값을 L 폼 문자열로. 값이 없으면 빈 칸 */
const toLiterForm = (cubicMeters: number | null): string => {
  const liters = litersOf(cubicMeters);
  return liters === null || !Number.isFinite(liters) ? "" : String(liters);
};

/**
 * 등속흡인 행의 잠긴 칸에 보여 줄 값을 **현재 입력에서** 만든다 — 서버 `IsokineticSampleStep` 과 같은 식.
 * 채취시각은 입자상 섹션의 시작·종료, 채취량(L)은 Vm(m³)×1000, 흡인유량(L/min)은 채취량 ÷ 총채취시간(분).
 *
 * 폼에 써 넣지 않고 표시만 대체한다 — 저장 응답이 어차피 서버 값으로 덮으므로, 폼 상태를 동기화하는 effect 를 두면
 * 기준선(baseline)·동시편집 병합이 자동값을 편집으로 오인한다. 등속흡인 행이 아니거나 이 기록지가 그 출처가
 * 아니면(놓여서는 안 되는 자리) `null` — 호출부가 폼 값을 그대로 쓴다.
 */
export const calcIsokineticDisplay = (
  sample: SampleForm, sheet: SheetForm, preview: SheetCalcPreview | null, rules: SampleRules,
): IsokineticDisplay | null => {
  const source = getParticulateSource(sample.pollutantIds, rules);
  if (source === null || source !== sheet.category) return null;

  const beforeVm = toNumberOrNull(sheet.samplingPoints[0]?.beforeVm);
  const afterVm = toNumberOrNull(sheet.samplingPoints.at(-1)?.afterVm);
  const totalVm = preview?.particle.totalVm ?? null;
  const flowRate = calcSuctionFlowRate(litersOf(totalVm), preview?.particle.totalSamplingTime ?? null);

  return {
    startTime: sheet.particle.samplingStartTime,
    endTime: sheet.particle.samplingEndTime,
    beforeVolume: toLiterForm(beforeVm),
    afterVolume: toLiterForm(afterVm),
    samplingVolume: toLiterForm(totalVm),
    suctionQuantity: toFormNumber(flowRate),
  };
};
