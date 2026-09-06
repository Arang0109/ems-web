import type { SamplingSheet } from "@entities/schedule";
import { formatTime } from "@shared/lib";

import type { AnalysisRowForm } from "./types";

/**
 * 현장 기록지의 시료 채취시각을 항목별 분석 행으로 편다.
 *
 * 기록지는 흡착관 16종을 `VOCs-T` 한 병에, 알데히드류를 `VOCs` 한 병에 담아 <b>한 행</b>으로
 * 적지만 성적서는 물질마다 한 줄이다. 그 대응은 시료 행이 들고 있는 `pollutantIds` 에만 있다 —
 * 항목명 문자열로는 복원할 수 없다(사용자가 표기를 바꾸거나 병을 쪼갤 수 있다).
 *
 * <b>가져오기는 버튼으로만 한다.</b> 실험실에서 사람이 고쳐 놓은 시각을 기록지 저장이 말없이
 * 되돌리면 틀린 값이 그대로 성적서에 찍힌다. 무엇을 덮어쓰는지는 사용자가 보고 정해야 한다.
 */

/** 시각을 가져올 수 있는 항목 → "HH:mm" 시작·종료 */
export type SamplingTimeByPollutant = Map<number, { startedAt: string; endedAt: string }>;

/**
 * 기록지 전체에서 항목별 채취시각을 모은다.
 *
 * 같은 항목이 두 기록지에 적혀 있으면 <b>먼저 나온 것을 쓴다</b>. 정상 경로에서는 미배정 판정이
 * 기록지를 가로질러 이뤄져 중복이 생기지 않지만, 사용자가 직접 같은 항목을 두 곳에 적을 수는 있다.
 * 그때 어느 쪽이 맞는지는 코드가 정할 수 없으므로 호출부가 사용자에게 알린다.
 */
export const collectSamplingTimes = (sheets: SamplingSheet[]): SamplingTimeByPollutant => {
  const times: SamplingTimeByPollutant = new Map();

  for (const sheet of sheets) {
    for (const sample of sheet.gaseousSamplings ?? []) {
      const startedAt = formatTime(sample.samplingStartedAt);
      const endedAt = formatTime(sample.samplingEndedAt);
      // 시각이 하나도 없는 행은 아직 안 적은 것이다 — 가져오면 채워진 값을 빈 값으로 덮는다.
      if (startedAt === "" && endedAt === "") continue;

      for (const pollutantId of sample.pollutantIds ?? []) {
        if (times.has(pollutantId)) continue;
        times.set(pollutantId, { startedAt, endedAt });
      }
    }
  }

  return times;
};

/** 같은 항목이 여러 기록지에 적혀 값이 갈리는 항목 수 — 사용자에게 알릴 때 쓴다 */
export const countAmbiguousPollutants = (sheets: SamplingSheet[]): number => {
  const seen = new Map<number, string>();
  const ambiguous = new Set<number>();

  for (const sheet of sheets) {
    for (const sample of sheet.gaseousSamplings ?? []) {
      const key = `${formatTime(sample.samplingStartedAt)}~${formatTime(sample.samplingEndedAt)}`;
      if (key === "~") continue;

      for (const pollutantId of sample.pollutantIds ?? []) {
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
