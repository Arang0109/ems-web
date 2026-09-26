import type { SamplingPointForm, SheetForm } from "../types";
import { getDefaultSheetForm } from "../types";
import type { SheetBlock } from "../sync/blocks";
import { applyBlock } from "../sync/blocks";
import { fieldPath, isFilled, readField } from "./required-fields";

/**
 * 같은 회차의 기록지들이 공유하는 환경 값 — 기상정보·수분량·배출가스, 그리고 측정점의 온도·동정압.
 *
 * 같은 굴뚝에서 같은 시각에 잰 값이라 기록지(먼지·중금속·가스상 …)마다 다를 이유가 없는데, 서버 문서는
 * 기록지 단위로 갖고 있어 두 번째 기록지를 추가하면 빈 채로 시작한다. 이전 기록지의 값을 그대로 옮겨 오는
 * 것이 이 규칙의 전부다.
 *
 * 측정점은 기록지마다 다른 블록이지만 그 안의 **유량 측정값**(배출가스 온도·동압·정압)과 **DGM 입·출구 온도**는
 * 같다 — 현장에서는 모든 지점의 온도·동정압을 먼저 재고 나서 기록지별 채취를 시작하므로, 지점 순번을 맞춰 그 칸만
 * 옮긴다. 채취시간·적산값은 기록지마다 따로 재는 값이라 대상이 아니다. 시료·입자상도 마찬가지다.
 *
 * 저장하지 않고 화면만 채운다 — 이전 회차 불러오기와 같은 이유로, 값을 확인한 뒤 저장 버튼으로 보내야 한다.
 */
export const COMMON_BLOCKS: readonly SheetBlock[] = ["weather", "moisture", "exhaustGas"];

/** 측정점 안에서 기록지 사이에 같은 칸 — 배출가스 온도·동압·정압·DGM 입구/출구 온도 */
export const COMMON_POINT_FIELDS: readonly (keyof SamplingPointForm)[] = ["Ts", "Pv", "Ps", "inTm", "outTm"];

/** 앞 기록지 같은 순번 측정점의 온도·동정압만 이 측정점에 옮긴다. 앞 기록지에 그 순번이 없으면 그대로 둔다 */
const copyPointReadings = (target: SamplingPointForm[], source: SamplingPointForm[]): SamplingPointForm[] =>
  target.map((point, i) => {
    const from = source[i];
    if (!from) return point;
    return COMMON_POINT_FIELDS.reduce((p, key) => ({ ...p, [key]: from[key] }), point);
  });

/** 이전 기록지 값을 활성 기록지에 복사한 시트. 세 블록과 측정점 온도·동정압만 바뀌고 나머지는 그대로다 */
export const copyCommonSections = (target: SheetForm, source: SheetForm): SheetForm => {
  const withBlocks = COMMON_BLOCKS.reduce((sheet, block) => applyBlock(sheet, source, block), target);
  return { ...withBlocks, samplingPoints: copyPointReadings(target.samplingPoints, source.samplingPoints) };
};

/**
 * 동기화 출처 — 탭 순서상 바로 앞 기록지. 첫 기록지는 출처가 없다.
 * 앞 기록지가 비어 있어도 그것을 출처로 삼는다 — "어느 기록지에서 가져오는가"가 예측 가능해야 한다.
 */
export const findSyncSource = (sheets: SheetForm[], activeIndex: number): SheetForm | null =>
  activeIndex > 0 ? (sheets[activeIndex - 1] ?? null) : null;

/** 동기화가 건드리는 칸 경로 전부 — 값 존재 판정용 */
const commonFieldPaths = (sheet: SheetForm): string[] => [
  ...(Object.keys(sheet.weather) as (keyof SheetForm["weather"])[]).map(fieldPath.weather),
  ...(Object.keys(sheet.moisture) as (keyof SheetForm["moisture"])[]).map(fieldPath.moisture),
  fieldPath.exhaustTime("gasAnalyzerStartTime"),
  fieldPath.exhaustTime("thcAnalyzerStartTime"),
  ...(["o2", "co2", "co", "nox", "sox"] as const).flatMap((column) =>
    sheet.exhaustGas[column].map((_, i) => fieldPath.exhaustReading(column, i))),
  ...sheet.samplingPoints.flatMap((_, i) => COMMON_POINT_FIELDS.map((key) => fieldPath.point(i, key))),
];

/**
 * 동기화가 건드리는 칸에 사용자가 적은 값이 하나라도 있는가 — 덮어쓰기 전에 물을지 정한다.
 * 빈 기록지에도 O₂ 20.9·CO₂ 0 같은 업무 기본값이 들어 있으므로, 기본 폼과 **다른** 칸만 값으로 본다.
 */
export const hasCommonSectionValues = (sheet: SheetForm): boolean => {
  const defaults = getDefaultSheetForm(sheet.category, sheet.samplingPoints.length);
  return commonFieldPaths(sheet).some((path) => {
    const value = readField(sheet, path);
    return isFilled(value) && value !== readField(defaults, path);
  });
};
