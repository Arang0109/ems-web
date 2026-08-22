import type { SheetCalcPreview } from "@entities/schedule";
import { fromMinutes, toMinutes, withSubjectJosa } from "@shared/lib";

import {
  GAS_ANALYZER_DURATION_MINUTES,
  THC_ANALYZER_DURATION_MINUTES,
  calcMoistureSamplingMinutes,
  calcParticleSamplingMinutes,
} from "./derived-times";
import type { ScheduleBasicInfoForm, SheetForm } from "./types";
import { isParticleCategory } from "./types";

/**
 * 측정 시각 타임라인 — 흩어진 시각 입력을 하나의 축에 올리고 모순을 찾는다.
 *
 * 이 화면의 시각은 총 채취시간(측정계획 단위) 아래에 수분·가스분석기·THC·입자상·가스상 항목이
 * 놓이는 구조인데, 입력칸이 섹션마다 떨어져 있어 앞뒤가 어긋나도 알아채기 어렵다.
 * 여기서 구간을 만들고 규칙 위반을 모아, 팝오버가 그리기만 하면 되게 한다.
 *
 * **판정은 하되 저장은 막지 않는다** — 이 폼은 부분 저장을 허용하는 것이 기존 정책이다.
 */

// ─────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────

export type TimelineRowKind = "total" | "moisture" | "gas" | "thc" | "particle" | "sample";

export interface TimelineRow {
  id: string;
  kind: TimelineRowKind;
  label: string;
  /** 표시용 시작 시각 "HH:mm" */
  startText: string;
  /** 표시용 종료 시각. 종료를 모르는 시점 마커면 null */
  endText: string | null;
  /** 종료가 입력이 아니라 산출값인가 — "자동" 배지의 근거 */
  endDerived: boolean;
  /** 종료를 알 수 없거나 신뢰할 수 없어 시점만 찍는 행 */
  isMarker: boolean;
  /** 축 시작(axis.startMinutes) 기준 오프셋(분) */
  startOffset: number;
  /** 마커면 startOffset 과 같다 */
  endOffset: number;
  /** 왜 마커로 남았는지 등 행에 붙는 한 줄 설명 */
  note?: string;
}

export type TimelineIssueLevel = "warning" | "danger";

export type TimelineIssueCode =
  | "reversed-range"
  | "outside-total"
  | "total-missing"
  | "zero-duration"
  | "crosses-midnight";

export interface TimelineIssue {
  code: TimelineIssueCode;
  level: TimelineIssueLevel;
  message: string;
  /** 강조할 행 id */
  rowIds: string[];
}

export interface TimelineAxis {
  /** 자정 언롤 후 값이라 1440 을 넘거나 음수일 수 있다 */
  startMinutes: number;
  /** 항상 0 보다 크다 */
  spanMinutes: number;
  ticks: { offset: number; label: string }[];
}

export interface SamplingTimeline {
  rows: TimelineRow[];
  /** 그릴 행이 하나도 없으면 null */
  axis: TimelineAxis | null;
  /** 경고 먼저, 같은 수준은 행 순서 */
  issues: TimelineIssue[];
  issueCount: number;
  worstLevel: TimelineIssueLevel | null;
}

export interface SamplingTimelineInput {
  basicInfo: ScheduleBasicInfoForm;
  sheet: SheetForm;
  /** 수분 채취시간 산출에 필요한 흡입량(vm_g)의 출처 */
  previewCalc: SheetCalcPreview | null;
}

// ─────────────────────────────────────────────────────────────
// 자정 순환 처리
// ─────────────────────────────────────────────────────────────

const MINUTES_PER_DAY = 1440;
const HALF_DAY_MINUTES = 720;

/** 축이 너무 좁아 한 구간이 화면을 다 먹는 것을 막는 최소 폭 */
const MIN_AXIS_SPAN_MINUTES = 30;

/**
 * `anchor` 로부터 ±12시간 안에 들어오도록 ±24시간을 더해 편 값.
 *
 * 시각은 하루 안에서만 표현되므로 `22:00 → 05:00` 이 야간 측정인지 오타인지 알 수 없다.
 * "가장 가까운 해석을 택한다"는 규칙 하나로 둘을 가른다 — 05:00 은 +420분(야간)이 되고,
 * `09:30 → 08:30` 은 -60분이 되어 역전으로 잡힌다. 임계값 상수가 필요 없다.
 */
export const unrollNear = (raw: number, anchor: number): number => {
  const diff =
    ((((raw - anchor + HALF_DAY_MINUTES) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY) -
    HALF_DAY_MINUTES;
  return anchor + diff;
};

// ─────────────────────────────────────────────────────────────
// 행 수집
// ─────────────────────────────────────────────────────────────

/** 축 좌표를 붙이기 전의 중간 표현 */
interface RawRow {
  id: string;
  kind: TimelineRowKind;
  label: string;
  /** 자정 언롤 전의 원시 분 값 */
  rawStart: number;
  /** 직접 입력 종료의 원시 분 값. 파생·미입력이면 null */
  rawEnd: number | null;
  /** 시작에 더할 지속시간(분). 파생 종료를 가진 행만 채운다 */
  durationMinutes: number | null;
  endDerived: boolean;
  note?: string;
}

const SAMPLE_LABEL_FALLBACK = "가스상 항목";

/**
 * 폼에서 타임라인 행 후보를 모은다. **시작시각이 비어 있으면 행을 만들지 않는다.**
 *
 * 이 규칙 하나로 조건부 항목(THC·입자상)의 노출 판정이 저절로 맞아떨어진다 —
 * 배정되지 않은 항목은 애초에 입력칸이 없어 시작시각이 비어 있기 때문이다.
 */
export const collectRawRows = ({
  basicInfo,
  sheet,
  previewCalc,
}: SamplingTimelineInput): RawRow[] => {
  const rows: RawRow[] = [];

  const totalStart = toMinutes(basicInfo.samplingStartedAt);
  if (totalStart !== null) {
    rows.push({
      id: "total",
      kind: "total",
      label: "총 채취시간",
      rawStart: totalStart,
      rawEnd: toMinutes(basicInfo.samplingEndedAt),
      durationMinutes: null,
      endDerived: false,
    });
  }

  const moistureStart = toMinutes(sheet.moisture.samplingStartTime);
  if (moistureStart !== null) {
    const minutes = calcMoistureSamplingMinutes(sheet.moisture, previewCalc);
    rows.push({
      id: "moisture",
      kind: "moisture",
      label: "수분 채취",
      rawStart: moistureStart,
      rawEnd: null,
      durationMinutes: minutes,
      endDerived: false,
      note: minutes === null ? "흡인유속·흡인량을 입력하면 종료시각이 산출됩니다." : undefined,
    });
  }

  const gasStart = toMinutes(sheet.exhaustGas.gasAnalyzerStartTime);
  if (gasStart !== null) {
    rows.push({
      id: "gas",
      kind: "gas",
      label: "가스분석기",
      rawStart: gasStart,
      rawEnd: null,
      durationMinutes: GAS_ANALYZER_DURATION_MINUTES,
      endDerived: false,
    });
  }

  const thcStart = toMinutes(sheet.exhaustGas.thcAnalyzerStartTime);
  if (thcStart !== null) {
    rows.push({
      id: "thc",
      kind: "thc",
      label: "THC",
      rawStart: thcStart,
      rawEnd: null,
      durationMinutes: THC_ANALYZER_DURATION_MINUTES,
      endDerived: true,
    });
  }

  // 저장된 종료시각을 믿지 않고 지점 채취시간에서 다시 구한다 — 서버 값과 어긋날 여지를 없앤다.
  const particleStart = isParticleCategory(sheet.category)
    ? toMinutes(sheet.particle.samplingStartTime)
    : null;
  if (particleStart !== null) {
    rows.push({
      id: "particle",
      kind: "particle",
      label: "입자상 채취",
      rawStart: particleStart,
      rawEnd: null,
      durationMinutes: calcParticleSamplingMinutes(sheet.samplingPoints),
      endDerived: true,
    });
  }

  sheet.samples.forEach((sample, index) => {
    const start = toMinutes(sample.startTime);
    if (start === null) return;

    const name = sample.sampleName.trim();
    rows.push({
      id: `sample-${index}`,
      kind: "sample",
      label: name || `${SAMPLE_LABEL_FALLBACK} ${index + 1}`,
      rawStart: start,
      rawEnd: toMinutes(sample.endTime),
      durationMinutes: null,
      endDerived: false,
    });
  });

  return rows;
};

// ─────────────────────────────────────────────────────────────
// 좌표 계산
// ─────────────────────────────────────────────────────────────

/** 언롤된 절대 분 좌표를 가진 행 */
interface PlacedRow extends RawRow {
  startMinutes: number;
  /** 마커면 startMinutes 와 같다 */
  endMinutes: number;
  isMarker: boolean;
  /** 종료가 시작보다 빠른 입력 — 막대 대신 마커로 격하하고 경고를 낸다 */
  reversed: boolean;
}

const place = (rows: RawRow[]): PlacedRow[] => {
  // 총 채취시간이 있으면 그것이 기준이다. 없으면 첫 행(행 순서는 고정)을 앵커로 쓴다.
  const anchor = rows[0]?.rawStart ?? 0;

  return rows.map((row) => {
    const startMinutes = unrollNear(row.rawStart, anchor);

    // 파생 종료는 시작에서 앞으로만 흐르므로 언롤이 필요 없고, 역전도 구조상 불가능하다.
    if (row.durationMinutes !== null) {
      return {
        ...row,
        startMinutes,
        endMinutes: startMinutes + row.durationMinutes,
        isMarker: false,
        reversed: false,
      };
    }

    // 종료를 알 수 없는 행 (수분 파생 실패, 종료 미입력)
    if (row.rawEnd === null) {
      return { ...row, startMinutes, endMinutes: startMinutes, isMarker: true, reversed: false };
    }

    const endMinutes = unrollNear(row.rawEnd, startMinutes);
    const reversed = endMinutes < startMinutes;

    // 역전된 구간을 그대로 그리면 음수 폭이 되어 축이 망가진다. 시점으로 격하하고 경고만 남긴다.
    return {
      ...row,
      startMinutes,
      endMinutes: reversed ? startMinutes : endMinutes,
      isMarker: reversed,
      reversed,
    };
  });
};

/** 눈금 간격 후보 — 눈금이 4~7개가 되는 첫 단위를 고른다 */
const TICK_STEPS = [5, 10, 15, 30, 60, 120, 180, 360];

export const buildTimelineAxis = (rows: PlacedRow[]): TimelineAxis | null => {
  if (rows.length === 0) return null;

  const rawStart = Math.min(...rows.map((r) => r.startMinutes));
  const rawEnd = Math.max(...rows.map((r) => r.endMinutes));
  const rawSpan = rawEnd - rawStart;

  // 모든 시각이 한 점이면 좌우로 15분씩 벌려 막대가 가장자리에 붙지 않게 한다.
  const pad = rawSpan === 0 ? 15 : Math.max(5, rawSpan * 0.06);
  const paddedStart = rawStart - pad;
  const paddedSpan = rawSpan + pad * 2;

  // 최소 폭을 보장하되 내용의 중심은 유지한다.
  const spanMinutes = Math.max(paddedSpan, MIN_AXIS_SPAN_MINUTES);
  const startMinutes = paddedStart - (spanMinutes - paddedSpan) / 2;

  const step =
    TICK_STEPS.find((candidate) => spanMinutes / candidate <= 7) ??
    TICK_STEPS[TICK_STEPS.length - 1];

  const ticks: TimelineAxis["ticks"] = [];
  for (
    let tick = Math.ceil(startMinutes / step) * step;
    tick <= startMinutes + spanMinutes;
    tick += step
  ) {
    ticks.push({ offset: tick - startMinutes, label: fromMinutes(tick) });
  }

  return { startMinutes, spanMinutes, ticks };
};

// ─────────────────────────────────────────────────────────────
// 위반 판정
// ─────────────────────────────────────────────────────────────

/**
 * 시각 간 모순을 찾는다.
 *
 * 겹침은 일부러 보지 않는다 — 가스상 항목은 동시 채취가 정상이라 겹침을 위반으로 잡으면
 * 상시 오탐이 뜨고, 그 소음 때문에 진짜 경고까지 무시된다.
 */
export const findTimelineIssues = (rows: PlacedRow[]): TimelineIssue[] => {
  const warnings: TimelineIssue[] = [];
  const dangers: TimelineIssue[] = [];

  const total = rows.find((row) => row.kind === "total");
  const details = rows.filter((row) => row.kind !== "total");

  rows.forEach((row) => {
    if (row.reversed) {
      dangers.push({
        code: "reversed-range",
        level: "danger",
        message: `${row.label}의 종료시각이 시작시각보다 빠릅니다.`,
        rowIds: [row.id],
      });
    }

    if (!row.isMarker && row.endMinutes === row.startMinutes) {
      warnings.push({
        code: "zero-duration",
        level: "warning",
        message: `${row.label}의 채취시간이 0분입니다.`,
        rowIds: [row.id],
      });
    }

    // 자정을 실제로 넘긴 행 — 오탐이 아니라 해석의 진술이라 안전하게 알릴 수 있다.
    if (
      !row.isMarker &&
      Math.floor(row.startMinutes / MINUTES_PER_DAY) !== Math.floor(row.endMinutes / MINUTES_PER_DAY)
    ) {
      warnings.push({
        code: "crosses-midnight",
        level: "warning",
        message: `${withSubjectJosa(row.label)} 자정을 넘깁니다. 다음 날로 해석했습니다.`,
        rowIds: [row.id],
      });
    }
  });

  // 총 채취시간이 온전할 때만 범위를 따진다. 역전된 총 구간을 기준으로 삼으면 전부 밖이 된다.
  if (total && !total.isMarker && total.endMinutes > total.startMinutes) {
    details.forEach((row) => {
      if (row.startMinutes < total.startMinutes || row.endMinutes > total.endMinutes) {
        dangers.push({
          code: "outside-total",
          level: "danger",
          message:
            `${withSubjectJosa(row.label)} 총 채취시간` +
            `(${fromMinutes(total.startMinutes)}~${fromMinutes(total.endMinutes)}) 밖에 있습니다.`,
          rowIds: [row.id],
        });
      }
    });
  } else if (details.length > 0) {
    warnings.push({
      code: "total-missing",
      level: "warning",
      message: "총 채취시간이 비어 있어 세부 시각의 범위를 확인할 수 없습니다.",
      rowIds: total ? [total.id] : [],
    });
  }

  return [...dangers, ...warnings];
};

// ─────────────────────────────────────────────────────────────
// 진입점
// ─────────────────────────────────────────────────────────────

export const buildSamplingTimeline = (input: SamplingTimelineInput): SamplingTimeline => {
  const placed = place(collectRawRows(input));
  const axis = buildTimelineAxis(placed);

  if (!axis) {
    return { rows: [], axis: null, issues: [], issueCount: 0, worstLevel: null };
  }

  const rows: TimelineRow[] = placed.map((row) => ({
    id: row.id,
    kind: row.kind,
    label: row.label,
    startText: fromMinutes(row.startMinutes),
    // 역전된 행도 입력한 종료시각은 그대로 보여준다 — 무엇이 잘못됐는지 알아야 고칠 수 있다.
    endText: row.reversed
      ? fromMinutes(row.rawEnd as number)
      : row.isMarker
        ? null
        : fromMinutes(row.endMinutes),
    endDerived: row.endDerived,
    isMarker: row.isMarker,
    startOffset: row.startMinutes - axis.startMinutes,
    endOffset: row.endMinutes - axis.startMinutes,
    note: row.note,
  }));

  const issues = findTimelineIssues(placed);

  return {
    rows,
    axis,
    issues,
    issueCount: issues.length,
    worstLevel: issues.some((i) => i.level === "danger")
      ? "danger"
      : issues.length > 0
        ? "warning"
        : null,
  };
};
