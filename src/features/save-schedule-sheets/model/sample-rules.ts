import type { MeasurementItemSnapshot, SheetCalcPreview } from "@entities/schedule";
import { addMinutes } from "@shared/lib";
import type { MeasurementCategory, MeasurementMode } from "@shared/model";

import type { SampleFieldKey } from "./required-fields";
import type { SampleForm, SheetForm } from "./types";

/**
 * 가스상 시료 행의 파생 규칙 — 행이 담은 항목(`pollutantIds`)에서 유도되는 두 가지.
 *
 * 1. **등속흡인 행** — 카탈로그 측정방식이 먼지·중금속·수은인 항목(비소화합물 흡수액)이 담긴 병은
 *    등속흡인 트레인의 병이라, 채취시각·흡인유량·채취량이 입력값이 아니라 같은 기록지 입자상 집계의
 *    사본이다. 서버(`IsokineticSampleStep`)가 저장할 때마다 덮어쓰므로 화면은 그 칸을 잠그고, 폼 값 대신
 *    입력에서 실시간 파생한 값을 보여 준다({@link getIsokineticDisplay}) — 행을 지웠다 다시 넣어도 값이 보여야 한다.
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

/**
 * 등속흡인 방식 항목이 채취되는 입자상 기록지 — 서버 `MeasurementCategory.particulateSourceOf` 와 같은 매핑.
 * 먼지·중금속·수은 기록지는 그 방식의 등속흡인 트레인 자체라 이름이 같다.
 */
export const particulateSourceOf = (mode: MeasurementMode | null): MeasurementCategory | null => {
  switch (mode) {
    case "DUST": return "DUST";
    case "HEAVY_METAL": return "HEAVY_METAL";
    case "MERCURY": return "MERCURY";
    default: return null;
  }
};

export const isIsokineticMode = (mode: MeasurementMode | null): boolean => particulateSourceOf(mode) !== null;

/** 등속흡인 행에서 서버가 입자상 집계로 덮어쓰는 칸 — 화면에서는 잠그고 파생값을 보여 준다 */
export const ISOKINETIC_DERIVED_FIELDS: readonly SampleFieldKey[] = [
  "startTime", "endTime", "suctionQuantity", "samplingVolume",
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
export const getSampleEndTime = (
  start: string, pollutantIds: number[], rules: SampleRules,
): string | null => {
  if (isIsokineticSample(pollutantIds, rules)) return null;
  const minutes = getSampleSamplingMinutes(pollutantIds, rules);
  return minutes === null ? null : addMinutes(start, minutes);
};

/** 등속흡인 행에 표시할 파생값 — 잠긴 4칸의 값이며 폼 값을 대신한다 */
export type IsokineticDisplay = Pick<SampleForm, "startTime" | "endTime" | "suctionQuantity" | "samplingVolume">;

const LITERS_PER_CUBIC_METER = 1000;

/** 서버(`Calculator.round(…, 2)`)와 같은 자릿수. 폼 문자열이라 불필요한 0은 붙이지 않는다 */
const toFormNumber = (value: number | null): string =>
  value === null || !Number.isFinite(value) ? "" : String(Math.round(value * 100) / 100);

/**
 * 등속흡인 행의 잠긴 칸에 보여 줄 값을 **현재 입력에서** 만든다 — 서버 `IsokineticSampleStep` 과 같은 식.
 * 채취시각은 입자상 섹션의 시작·종료, 채취량(L)은 Vm(m³)×1000, 흡인유량(L/min)은 채취량 ÷ 총채취시간(분).
 *
 * 폼에 써 넣지 않고 표시만 대체한다 — 저장 응답이 어차피 서버 값으로 덮으므로, 폼 상태를 동기화하는 effect 를 두면
 * 기준선(baseline)·동시편집 병합이 자동값을 편집으로 오인한다. 등속흡인 행이 아니거나 이 기록지가 그 출처가
 * 아니면(놓여서는 안 되는 자리) `null` — 호출부가 폼 값을 그대로 쓴다.
 */
export const getIsokineticDisplay = (
  sample: SampleForm, sheet: SheetForm, preview: SheetCalcPreview | null, rules: SampleRules,
): IsokineticDisplay | null => {
  const source = getParticulateSource(sample.pollutantIds, rules);
  if (source === null || source !== sheet.category) return null;

  const totalVm = preview?.particle.totalVm ?? null;
  const totalMinutes = preview?.particle.totalSamplingTime ?? null;
  const liters = totalVm === null ? null : totalVm * LITERS_PER_CUBIC_METER;
  const flowRate = liters === null || totalMinutes === null || totalMinutes === 0 ? null : liters / totalMinutes;

  return {
    startTime: sheet.particle.samplingStartTime,
    endTime: sheet.particle.samplingEndTime,
    samplingVolume: toFormNumber(liters),
    suctionQuantity: toFormNumber(flowRate),
  };
};
