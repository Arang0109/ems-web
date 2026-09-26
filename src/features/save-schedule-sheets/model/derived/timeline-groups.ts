import type { SamplingTimeline, TimelineRow } from "./sampling-timeline";

/**
 * 측정 시각을 **동시 진행 묶음**으로 나눈 텍스트 타임라인.
 *
 * 간트 막대는 겹침과 빈 시간을 보여 주는 대신 폭이 좁아지면 읽을 수 없었다. 막대가 보여 주던 두 가지를
 * 글로 옮긴다 — 시간이 겹치는 항목끼리 한 묶음으로 모으고(겹침), 묶음 사이에 공백 시간을 적는다(빈 시간).
 * 묶음은 시작 순이라 위에서 아래로 읽으면 측정의 흐름이 된다.
 */

export interface TimelineGroup {
  id: string;
  /** 축 시작 기준 오프셋(분) */
  startOffset: number;
  endOffset: number;
  startText: string;
  endText: string;
  /** 시작 순 */
  rows: TimelineRow[];
  /** 같은 순간에 진행 중이던 항목 수의 최댓값 — 묶음에 3개가 있어도 동시에는 2개였을 수 있다 */
  maxConcurrency: number;
  /** 앞 묶음이 끝나고 이 묶음이 시작하기까지의 공백(분). 첫 묶음이거나 공백이 없으면 null */
  gapBeforeMinutes: number | null;
}

export interface TimelineGroups {
  total: TimelineRow | null;
  groups: TimelineGroup[];
}

/** 시점(종료 미상·역전·0분)은 시작 순간 하나만 차지한다 */
const endOf = (row: TimelineRow): number => (row.isMarker ? row.startOffset : row.endOffset);

/**
 * 같은 순간에 진행 중인 구간 수의 최댓값.
 * 같은 순간이면 **구간의 끝 → 시작 → 시점의 끝** 순으로 처리한다 — 끝나는 순간에 시작하는 것은 겹치지 않고,
 * 시점(폭 0)은 그 순간 시작하는 다른 항목과 겹친 것으로 센다.
 */
const calcMaxConcurrency = (rows: TimelineRow[]): number => {
  const edges = rows.flatMap((row) => {
    const isPoint = endOf(row) === row.startOffset;
    return [
      { at: row.startOffset, order: 1, delta: 1 },
      { at: endOf(row), order: isPoint ? 2 : 0, delta: -1 },
    ];
  });
  edges.sort((a, b) => a.at - b.at || a.order - b.order);

  let current = 0;
  let max = 0;
  edges.forEach((edge) => {
    current += edge.delta;
    max = Math.max(max, current);
  });
  return max;
};

/**
 * 시간이 겹치는 항목끼리 묶는다. 앞 묶음이 끝나는 순간에 시작하는 항목은 **새 묶음**이다 —
 * 이어 붙은 채취까지 한 묶음으로 모으면 연속 측정 전체가 한 덩어리가 되어 흐름이 사라진다.
 */
export const buildTimelineGroups = ({ rows }: SamplingTimeline): TimelineGroups => {
  const total = rows.find((row) => row.kind === "total") ?? null;
  const details = rows
    .filter((row) => row.kind !== "total")
    // 정렬은 안정적이라 같은 시작이면 행 순서(공통 → 기록지별)가 유지된다.
    .sort((a, b) => a.startOffset - b.startOffset);

  const clusters: TimelineRow[][] = [];
  let clusterEnd = -Infinity;
  let lastStart = -Infinity;
  details.forEach((row) => {
    const current = clusters[clusters.length - 1];
    // 같은 순간에 시작한 것은 함께 시작한 것이다 — 앞 항목이 시점(폭 0)이어도 한 묶음이다.
    if (current && (row.startOffset < clusterEnd || row.startOffset === lastStart)) {
      current.push(row);
      clusterEnd = Math.max(clusterEnd, endOf(row));
    } else {
      clusters.push([row]);
      clusterEnd = endOf(row);
    }
    lastStart = row.startOffset;
  });

  let prevEnd: number | null = null;
  const groups = clusters.map((cluster): TimelineGroup => {
    const startOffset = cluster[0].startOffset;
    const endOffset = Math.max(...cluster.map(endOf));
    // 묶음 경계 시각은 속한 행의 표기에서 가져온다 — 오프셋을 다시 시각으로 바꾸면 자정 순환을 두 번 다룬다.
    const first = cluster[0];
    const last = cluster.reduce((a, b) => (endOf(b) > endOf(a) ? b : a));

    const gap = prevEnd !== null && startOffset > prevEnd ? startOffset - prevEnd : null;
    prevEnd = endOffset;

    return {
      id: first.id,
      startOffset,
      endOffset,
      startText: first.startText,
      endText: last.isMarker ? last.startText : (last.endText ?? last.startText),
      rows: cluster,
      maxConcurrency: calcMaxConcurrency(cluster),
      gapBeforeMinutes: gap,
    };
  });

  return { total, groups };
};

/** 구간 길이(분). 시점이면 null */
export const calcRowMinutes = (row: TimelineRow): number | null =>
  row.isMarker ? null : row.endOffset - row.startOffset;

/**
 * 분 → "15분", "1시간 10분", "3시간". 수분 채취시간은 흡입량 ÷ 유속이라 소수가 나오므로 분 단위로 반올림한다.
 */
export const describeMinutes = (minutes: number): string => {
  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  if (hours === 0) return `${rest}분`;
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`;
};
