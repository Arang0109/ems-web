import type { MeasurementItemSnapshot, SamplingSheet } from "@entities/schedule";
import { particulateSourceOf } from "@entities/schedule";
import { formatTime } from "@shared/lib";

import type { AnalysisRowForm } from "./types";

/**
 * 현장 기록지의 시료 채취시각을 항목별 분석 행으로 편다.
 *
 * 기록지는 흡착관 16종을 `VOCs-T` 한 병에, 알데히드류를 `VOCs` 한 병에 담아 <b>한 행</b>으로
 * 적지만 성적서는 물질마다 한 줄이다. 그 대응은 시료 행이 들고 있는 `pollutantIds` 에만 있다 —
 * 항목명 문자열로는 복원할 수 없다(사용자가 표기를 바꾸거나 병을 쪼갤 수 있다).
 *
 * 입자상 기록지(먼지·중금속·수은)의 채취시각은 시료 행이 아니라 시트 집계(`particulateSampling`)에 있고,
 * 그 블록은 pollutantId 를 갖지 않는다 — 트레인 하나가 무엇을 잡았는지는 측정항목의 `mode` 가 정하므로
 * `particulateSourceOf(item.mode) === sheet.category` 인 항목이 그 시각을 받는다. 그래서 기록지만으로는
 * 못 펴고 측정항목 스냅샷이 함께 필요하다.
 *
 * <b>가져오기는 버튼으로만 한다.</b> 실험실에서 사람이 고쳐 놓은 시각을 기록지 저장이 말없이
 * 되돌리면 틀린 값이 그대로 성적서에 찍힌다. 무엇을 덮어쓰는지는 사용자가 보고 정해야 한다.
 */

/** 시각을 가져올 수 있는 항목 → "HH:mm" 시작·종료 */
export type SamplingTimeByPollutant = Map<number, { startedAt: string; endedAt: string }>;

/** 기록지에서 시각을 들고 있는 단위 하나 — 가스상 시료 행 또는 입자상 집계 */
type TimedSample = { pollutantIds: number[]; startedAt: string; endedAt: string };

/** 이 카테고리의 입자상 기록지가 잡는 항목들 */
const getParticulatePollutantIds = (
  category: SamplingSheet["category"], items: MeasurementItemSnapshot[],
): number[] =>
  items.filter((item) => particulateSourceOf(item.mode) === category).map((item) => item.pollutantId);

/**
 * 기록지 하나에서 시각이 적힌 단위를 순서대로 낸다 — 가스상 시료 행 전부, 그다음 입자상 집계 한 건.
 *
 * 시각이 하나도 없는 단위는 아직 안 적은 것이라 내지 않는다 — 가져오면 채워진 값을 빈 값으로 덮는다.
 * 수집과 중복 판정이 같은 목록을 보도록 이 한 곳에서만 편다.
 */
const listTimedSamples = (sheet: SamplingSheet, items: MeasurementItemSnapshot[]): TimedSample[] => {
  const samples: TimedSample[] = [];

  for (const sample of sheet.gaseousSamplings ?? []) {
    const startedAt = formatTime(sample.samplingStartedAt);
    const endedAt = formatTime(sample.samplingEndedAt);
    if (startedAt === "" && endedAt === "") continue;
    samples.push({ pollutantIds: sample.pollutantIds ?? [], startedAt, endedAt });
  }

  const particle = sheet.particulateSampling;
  if (particle) {
    const startedAt = formatTime(particle.samplingStartedAt);
    const endedAt = formatTime(particle.samplingEndedAt);
    if (startedAt !== "" || endedAt !== "") {
      samples.push({ pollutantIds: getParticulatePollutantIds(sheet.category, items), startedAt, endedAt });
    }
  }

  return samples;
};

/**
 * 기록지 전체에서 항목별 채취시각을 모은다.
 *
 * 같은 항목이 두 곳에 적혀 있으면 <b>먼저 나온 것을 쓴다</b>. 정상 경로에서는 미배정 판정이
 * 기록지를 가로질러 이뤄져 중복이 생기지 않지만, 사용자가 직접 같은 항목을 두 곳에 적을 수는 있다.
 * 그때 어느 쪽이 맞는지는 코드가 정할 수 없으므로 호출부가 사용자에게 알린다.
 * (등속흡인 행과 같은 시트의 입자상 집계는 서버가 같은 값으로 맞춰 두므로 여기서는 충돌이 아니다.)
 */
export const collectSamplingTimes = (
  sheets: SamplingSheet[], items: MeasurementItemSnapshot[],
): SamplingTimeByPollutant => {
  const times: SamplingTimeByPollutant = new Map();

  for (const sheet of sheets) {
    for (const { pollutantIds, startedAt, endedAt } of listTimedSamples(sheet, items)) {
      for (const pollutantId of pollutantIds) {
        if (times.has(pollutantId)) continue;
        times.set(pollutantId, { startedAt, endedAt });
      }
    }
  }

  return times;
};

/** 같은 항목이 여러 곳에 적혀 값이 갈리는 항목 수 — 사용자에게 알릴 때 쓴다 */
export const countAmbiguousPollutants = (
  sheets: SamplingSheet[], items: MeasurementItemSnapshot[],
): number => {
  const seen = new Map<number, string>();
  const ambiguous = new Set<number>();

  for (const sheet of sheets) {
    for (const { pollutantIds, startedAt, endedAt } of listTimedSamples(sheet, items)) {
      const key = `${startedAt}~${endedAt}`;

      for (const pollutantId of pollutantIds) {
        const previous = seen.get(pollutantId);
        if (previous === undefined) seen.set(pollutantId, key);
        else if (previous !== key) ambiguous.add(pollutantId);
      }
    }
  }

  return ambiguous.size;
};

/** 가져온 시각을 행에 얹는다. 기록지에 없는 항목의 행은 그대로 둔다. */
export const applySamplingTimes = (
  rows: AnalysisRowForm[], times: SamplingTimeByPollutant,
): AnalysisRowForm[] =>
  rows.map((row) => {
    const found = times.get(row.pollutantId);
    if (!found) return row;

    return { ...row, samplingStartedAt: found.startedAt, samplingEndedAt: found.endedAt };
  });

/** 실제로 값이 달라지는 행 수 — 버튼을 눌러도 바뀔 것이 없으면 알려 준다 */
export const countSamplingTimeChanges = (
  rows: AnalysisRowForm[], times: SamplingTimeByPollutant,
): number =>
  applySamplingTimes(rows, times)
    .filter((next, i) => next.samplingStartedAt !== rows[i].samplingStartedAt
      || next.samplingEndedAt !== rows[i].samplingEndedAt)
    .length;
