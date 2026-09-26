import { addMinutes, roundHalfUp, toNumberOrNull } from "@shared/lib";

import type { SheetForm } from "../types";
import { isParticleCategory } from "../types";
import type { TimelineRow } from "./sampling-timeline";
import { COMMON_SOURCE_LABEL, describeSheets, sheetRowId } from "./sampling-timeline";

/**
 * 온도 표 — 섹션마다 흩어진 온도 입력을 **시각과 함께** 한 곳에 모은다.
 *
 * 온도 칸에는 시각이 없지만 대부분 시각이 있는 구간에 딸려 있다.
 * - 수분(가스미터 입·출구): 수분 채취 구간
 * - 입자상 지점(배출가스·DGM 입·출구·최종 임핀저): 입자상 시작 + 앞 지점 채취시간의 합
 * - 가스상 시료(입·출구): 시료의 시작~종료
 * 구간 시각은 시각 타임라인의 행에서 가져온다 — 두 탭이 같은 시각을 말해야 한다.
 * 대기온도는 딸린 구간이 없어 별도 값으로 낸다.
 */

// ─────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────

export type TemperatureTableKind = "moisture" | "point" | "sample";

export interface TemperatureTableRow {
  id: string;
  /** 무엇의 값인가 — "지점 1", "SOx", "수분 채취" */
  label: string;
  /** "09:30 ~ 09:40" */
  timeText: string;
  /** `columns` 와 같은 순서. 빈 칸은 null */
  values: (number | null)[];
}

export interface TemperatureTable {
  id: string;
  kind: TemperatureTableKind;
  label: string;
  /** 어느 기록지의 값인가. 기록지가 한 장이면 null */
  sourceLabel: string | null;
  /** 값이 하나라도 있는 칸만 — "입구", "DGM 출구" … */
  columns: string[];
  rows: TemperatureTableRow[];
}

export interface AmbientTemperature {
  value: number;
  sourceLabel: string | null;
}

export interface TemperatureTables {
  tables: TemperatureTable[];
  /** 대기온도 — 값이 기록지마다 다르면 여러 개 */
  ambient: AmbientTemperature[];
}

// ─────────────────────────────────────────────────────────────
// 표 만들기
// ─────────────────────────────────────────────────────────────

/** 빈 시각 표기 — 인쇄 기록지와 같은 표현을 쓴다 */
const EMPTY_TIME = "--:--";

const rangeText = (start: string, end: string | null) => `${start} ~ ${end ?? EMPTY_TIME}`;

/**
 * 값이 하나도 없는 칸과 줄을 뺀다. 줄이 하나도 안 남으면 표를 만들지 않는다.
 * 칸을 빼도 줄의 값 순서가 칸과 어긋나지 않도록 같은 색인으로 함께 거른다.
 */
const toTable = (
  table: Omit<TemperatureTable, "columns" | "rows">,
  columns: string[],
  rows: TemperatureTableRow[],
): TemperatureTable | null => {
  const kept = columns.map((_, i) => rows.some((row) => row.values[i] !== null));
  const filledRows = rows
    .filter((row) => row.values.some((value) => value !== null))
    .map((row) => ({ ...row, values: row.values.filter((_, i) => kept[i]) }));

  if (filledRows.length === 0) return null;
  return { ...table, columns: columns.filter((_, i) => kept[i]), rows: filledRows };
};

/** 수분 채취 시각을 아직 적지 않았을 때의 구간 표기 */
const NO_TIME_TEXT = "시각 미입력";

/**
 * 가스미터 입·출구 평균온도 = (입구 + 출구) ÷ 2, 소수 첫째 자리 반올림. 둘 중 하나라도 비면 null.
 *
 * 타임라인에서는 입·출구를 따로 보이지 않고 평균만 보인다. 계산값과 같은 식·같은 조건이다 —
 * 수분(`moistureStep` 의 tm_g)·측정점 DGM(`particleStep` 의 지점 avgTm)이 이렇게 구한다.
 * 가스상 시료는 계산에 쓰이는 평균이 없지만 같은 기기의 같은 두 값이라 같은 규칙을 쓴다.
 */
export const calcInOutAverage = (inValue: string, outValue: string): number | null => {
  const tIn = toNumberOrNull(inValue);
  const tOut = toNumberOrNull(outValue);
  return tIn === null || tOut === null ? null : roundHalfUp((tIn + tOut) / 2, 1);
};

/**
 * 수분 가스미터 평균온도 — 수분 채취 시각이 없어도 평균이 나오면 표시한다.
 * 가스미터 온도는 채취 전후로 먼저 적는 경우가 많아, 시각을 기다리면 표가 늦게 나타난다.
 *
 * 수분은 기록지끼리 복사해 쓰는 공통 섹션이라 **구간·온도가 같은 기록지끼리 한 줄**로 합친다.
 * 값이 갈리면 기록지마다 줄을 남겨 어긋남이 보이게 한다.
 */
const moistureTable = (sheets: SheetForm[], rows: TimelineRow[]): TemperatureTable | null => {
  const moistureRows = rows.filter((row) => row.kind === "moisture");

  const groups = new Map<string, { row: TimelineRow | null; average: number; sheets: SheetForm[] }>();
  sheets.forEach((sheet) => {
    const average = calcInOutAverage(sheet.moisture.gasMeterTempIn, sheet.moisture.gasMeterTempOut);
    if (average === null) return;

    const row = moistureRows.find((r) => r.categories.includes(sheet.category)) ?? null;
    const key = `${row?.id ?? "-"}|${average}`;
    const group = groups.get(key) ?? { row, average, sheets: [] };
    group.sheets.push(sheet);
    groups.set(key, group);
  });
  if (groups.size === 0) return null;

  const entries = [...groups.values()];
  const isMultiSheet = sheets.length > 1;
  const isSplit = entries.length > 1;
  const describe = (group: SheetForm[]) =>
    group.length === sheets.length ? COMMON_SOURCE_LABEL : describeSheets(group.map((sheet) => sheet.category));

  return toTable(
    {
      id: "moisture:temperature",
      kind: "moisture",
      label: "수분 가스미터",
      // 한 줄로 합쳐졌으면 출처를 표 머리에, 갈렸으면 줄마다 기록지 이름을 적는다.
      sourceLabel: isMultiSheet && !isSplit ? describe(entries[0].sheets) : null,
    },
    ["가스미터 온도"],
    entries.map((entry, i) => ({
      id: `moisture:temperature-${i}`,
      label: isMultiSheet && isSplit ? describe(entry.sheets) : "수분 채취",
      timeText: entry.row ? rangeText(entry.row.startText, entry.row.endText) : NO_TIME_TEXT,
      values: [entry.average],
    })),
  );
};

/** 측정점 온도 칸 — 입자상 기록지에서만 채취시간이 있어 구간을 만들 수 있다 */
const POINT_COLUMNS = ["배출가스", "가스미터 온도", "최종임핀저 출구온도"];

const pointValues = (point: SheetForm["samplingPoints"][number]): (number | null)[] => [
  toNumberOrNull(point.Ts),
  calcInOutAverage(point.inTm, point.outTm),
  toNumberOrNull(point.finalImpingerTemperature),
];

const pointTable = (sheet: SheetForm, rowsById: Map<string, TimelineRow>): TemperatureTable | null => {
  if (!isParticleCategory(sheet.category)) return null;

  const row = rowsById.get(sheetRowId(sheet.category, "particle"));
  if (!row) return null;

  // 지점 구간 — 입자상 종료시각과 같은 합산 규칙(calcParticleSamplingMinutes)을 누적으로 쓴다.
  let elapsed = 0;
  const tableRows = sheet.samplingPoints.map((point, index): TemperatureTableRow => {
    const start = addMinutes(row.startText, elapsed) ?? row.startText;
    elapsed += toNumberOrNull(point.samplingTime) ?? 0;
    const end = addMinutes(row.startText, elapsed);

    return {
      id: `${row.id}:point-${index}`,
      label: `지점 ${index + 1}`,
      timeText: rangeText(start, end),
      values: pointValues(point),
    };
  });

  return toTable(
    { id: `${row.id}:temperature`, kind: "point", label: "측정점", sourceLabel: row.sourceLabel },
    POINT_COLUMNS,
    tableRows,
  );
};

const sampleTable = (sheet: SheetForm, rowsById: Map<string, TimelineRow>): TemperatureTable | null => {
  // 시작시각이 없는 시료는 타임라인 행이 없다 — 시각 없이 온도만 늘어놓지 않는다.
  const placed = sheet.samples.flatMap((sample, index) => {
    const row = rowsById.get(sheetRowId(sheet.category, `sample-${index}`));
    return row ? [{ sample, row }] : [];
  });
  if (placed.length === 0) return null;

  return toTable(
    {
      id: `${sheet.category}:sample-temperature`,
      kind: "sample",
      label: "가스상 시료",
      sourceLabel: placed[0].row.sourceLabel,
    },
    ["가스미터 온도"],
    placed.map(({ sample, row }) => ({
      id: `${row.id}:temperature`,
      label: row.label,
      // 역전된 시료도 입력한 종료시각을 보여 준다(endText 가 원래 입력값이다).
      timeText: rangeText(row.startText, row.endText),
      values: [calcInOutAverage(sample.inTemperature, sample.outTemperature)],
    })),
  );
};

/** 대기온도 — 기상정보는 공통 섹션이라 같은 값끼리 합친다 */
const collectAmbient = (sheets: SheetForm[]): AmbientTemperature[] => {
  const byValue = new Map<number, SheetForm[]>();
  sheets.forEach((sheet) => {
    const value = toNumberOrNull(sheet.weather.temperature);
    if (value !== null) byValue.set(value, [...(byValue.get(value) ?? []), sheet]);
  });

  return [...byValue].map(([value, group]) => ({
    value,
    sourceLabel:
      sheets.length <= 1
        ? null
        : group.length === sheets.length
          ? COMMON_SOURCE_LABEL
          : describeSheets(group.map((sheet) => sheet.category)),
  }));
};

// ─────────────────────────────────────────────────────────────
// 진입점
// ─────────────────────────────────────────────────────────────

/**
 * 표 순서는 현장 순서를 따른다 — 수분 → 측정점 → 가스상 시료.
 * `rows` 는 `buildSamplingTimeline` 의 결과여야 한다(같은 구간 시각).
 */
export const buildTemperatureTables = (sheets: SheetForm[], rows: TimelineRow[]): TemperatureTables => {
  const rowsById = new Map(rows.map((row) => [row.id, row]));
  const present = <T>(value: T | null): value is T => value !== null;

  return {
    tables: [
      ...[moistureTable(sheets, rows)].filter(present),
      ...sheets.map((sheet) => pointTable(sheet, rowsById)).filter(present),
      ...sheets.map((sheet) => sampleTable(sheet, rowsById)).filter(present),
    ],
    ambient: collectAmbient(sheets),
  };
};
