import type { SamplingItemSnapshot, SamplingSheet } from "@entities/schedule";
import {
  calcGasAnalyzerEndTime, calcThcAnalyzerEndTime, isExhaustGasPollutant, particulateSourceOf,
} from "@entities/schedule";
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
 * 현장측정 항목(NOx·SOx·CO·THC)은 시료가 없어 어느 행에도 적히지 않는다. 시각은 배출가스 블록의 분석기
 * 시작시각뿐이고 종료는 규정상 고정이다 — 가스분석기 15분, THC 30분. 어느 항목이 THC 인지는 카탈로그
 * code(없으면 이름 별칭)로 가른다.
 *
 * <b>가져오기는 버튼으로만 한다.</b> 실험실에서 사람이 고쳐 놓은 시각을 기록지 저장이 말없이
 * 되돌리면 틀린 값이 그대로 성적서에 찍힌다. 무엇을 덮어쓰는지는 사용자가 보고 정해야 한다.
 */

/** 시각을 가져올 수 있는 항목 → "HH:mm" 시작·종료 */
export type SamplingTimeByPollutant = Map<number, { startedAt: string; endedAt: string; }>;

/** 기록지에서 시각을 들고 있는 단위 하나 — 가스상 시료 행 또는 입자상 집계 */
type TimedSample = { pollutantIds: number[]; startedAt: string; endedAt: string };

/** 이 카테고리의 입자상 기록지가 잡는 항목들 */
const getParticulatePollutantIds = (
  category: SamplingSheet["category"], items: SamplingItemSnapshot[],
): number[] =>
  items.filter((item) => particulateSourceOf(item.mode) === category).map((item) => item.pollutantId);

/** 배출가스 블록의 두 시각 — 가스분석기(NOx·SOx·CO)와 THC 는 분석기도 고정 측정시간도 다르다 */
type Analyzer = "gas" | "thc";

/**
 * 이 분석기로 재는 현장측정 항목들. `mode` 가 없는 구 문서는 입자상 경로와 같은 이유로 대상이 아니다 —
 * 무엇으로 쟀는지 스냅샷이 말해 주지 않는데 이름으로 추측하면 조용히 틀린 시각을 남긴다.
 */
const getAnalyzerPollutantIds = (analyzer: Analyzer, items: SamplingItemSnapshot[]): number[] =>
  items
    .filter((item) => item.mode === "DIRECT_READING")
    .filter((item) => isExhaustGasPollutant(item, "thc") === (analyzer === "thc"))
    .map((item) => item.pollutantId);

/**
 * 기록지 하나에서 시각이 적힌 단위를 순서대로 낸다 — 가스상 시료 행 전부, 입자상 집계 한 건,
 * 그다음 배출가스 분석기 둘(가스분석기·THC).
 *
 * 시각이 하나도 없는 단위는 아직 안 적은 것이라 내지 않는다 — 가져오면 채워진 값을 빈 값으로 덮는다.
 * 수집과 중복 판정이 같은 목록을 보도록 이 한 곳에서만 편다.
 */
const listTimedSamples = (sheet: SamplingSheet, items: SamplingItemSnapshot[]): TimedSample[] => {
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

  // 현장측정은 시작시각만 적고 종료는 고정 측정시간으로 정해진다 — 현장채취 탭이 보여 주는 종료시각과 같은 식.
  const exhaust = sheet.exhaustGas;
  if (exhaust) {
    const gasStartedAt = formatTime(exhaust.gasAnalyzerStartTime);
    if (gasStartedAt !== "") {
      samples.push({
        pollutantIds: getAnalyzerPollutantIds("gas", items),
        startedAt: gasStartedAt,
        endedAt: calcGasAnalyzerEndTime(gasStartedAt) ?? "",
      });
    }

    const thcStartedAt = formatTime(exhaust.thcAnalyzerStartTime);
    if (thcStartedAt !== "") {
      samples.push({
        pollutantIds: getAnalyzerPollutantIds("thc", items),
        startedAt: thcStartedAt,
        endedAt: calcThcAnalyzerEndTime(thcStartedAt) ?? "",
      });
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
  sheets: SamplingSheet[], items: SamplingItemSnapshot[],
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
  sheets: SamplingSheet[], items: SamplingItemSnapshot[],
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
