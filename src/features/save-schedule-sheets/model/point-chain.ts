import type { SamplingPointForm } from "./types";
import { getDefaultSamplingPointForm } from "./types";

/**
 * 측정점 사이에 걸리는 값의 규칙.
 *
 * 지점 입력은 대부분 지점마다 독립이지만 두 항목은 그렇지 않다.
 *
 * 1. **채취시간은 지점 공통값이다.** 한 지점만 다르게 채취하는 측정은 성립하지 않으므로
 *    어느 지점에 입력하든 전 지점이 같은 값을 갖는다.
 * 2. **DGM(건식가스미터) 채취량은 적산값이다.** 미터를 되돌리지 않고 지점을 옮기므로
 *    `지점 i 의 채취량-전 = 지점 i-1 의 채취량-후` 가 기본이다. 미터를 초기화했거나
 *    장비를 바꾼 현장이 있어 **고정하지는 않는다** — 손으로 고친 값은 지킨다.
 *
 * 폼 상태를 건드리는 곳(입력·지점 추가·전 지점 값 불러오기)이 셋이라 규칙을 여기 모은다.
 */

/**
 * 이 칸이 아직 "이어받은 그대로" 인가.
 *
 * 앞 지점의 채취량-후를 고칠 때 뒤 지점의 채취량-전을 따라 옮길지 판정한다.
 * 빈 칸이거나 고치기 전 값과 같으면 사용자가 손대지 않은 것이므로 따라간다.
 */
const isChainedFrom = (beforeVm: string, previousAfterVm: string): boolean =>
  beforeVm === "" || beforeVm === previousAfterVm;

/**
 * 지점 하나에 들어온 입력을 적용한다. 위 두 규칙에 걸리는 항목이면 다른 지점까지 함께 간다.
 *
 * - `samplingTime` — 전 지점에 같은 값을 넣는다.
 * - `afterVm` — 다음 지점의 채취량-전이 아직 이어받은 그대로일 때만 함께 옮긴다.
 */
export const applyPointPatch = (
  points: SamplingPointForm[],
  index: number,
  patch: Partial<SamplingPointForm>,
): SamplingPointForm[] => {
  const target = points[index];
  if (!target) return points;

  const { samplingTime, afterVm } = patch;
  const patched = points.map((p, i) => (i === index ? { ...p, ...patch } : p));

  const synced = samplingTime === undefined
    ? patched
    : patched.map((p) => ({ ...p, samplingTime }));

  if (afterVm === undefined) return synced;

  return synced.map((p, i) => (
    i === index + 1 && isChainedFrom(p.beforeVm, target.afterVm) ? { ...p, beforeVm: afterVm } : p
  ));
};

/**
 * 측정점 하나를 뒤에 붙인다. 채취시간(공통값)과 채취량-전(마지막 지점의 적산값)은
 * 빈 칸으로 두지 않고 규칙대로 채워 준다.
 */
export const appendPoint = (points: SamplingPointForm[]): SamplingPointForm[] => {
  const last = points[points.length - 1];

  return [...points, {
    ...getDefaultSamplingPointForm(),
    samplingTime: last?.samplingTime ?? "",
    beforeVm: last?.afterVm ?? "",
  }];
};

/**
 * 앞 지점 값을 통째로 복사한다 — 지점 간 조건이 비슷한 경우가 많아 다시 입력하는 수고를 던다.
 *
 * **DGM 채취량 두 칸은 복사 대상이 아니다.** 적산계의 눈금이라 앞 지점 값을 그대로 베끼면
 * 채취량(후 − 전)이 0 이 되어 버린다. 채취량-전은 규칙대로 앞 지점의 채취량-후를 잇고,
 * 채취량-후는 이 지점이 이미 갖고 있던 값을 그대로 둔다(대개 아직 재지 않은 빈 칸이다).
 */
export const copyPreviousPointValues = (
  points: SamplingPointForm[],
  index: number,
): SamplingPointForm[] => {
  const previous = points[index - 1];
  const current = points[index];
  if (!previous || !current) return points;

  const copied: SamplingPointForm = {
    ...previous,
    beforeVm: previous.afterVm,
    afterVm: current.afterVm,
  };

  return points.map((p, i) => (i === index ? copied : p));
};
