import { useMemo } from "react";

import { calcSheetPreview } from "@entities/schedule";
import type { SheetCalcExternals, SheetCalcPreview } from "@entities/schedule";

import type { ScheduleBasicInfoForm, SheetForm } from "../types";
import { toSheetSave } from "../mapper";
import { buildSamplingTimeline } from "../derived/sampling-timeline";
import type { SamplingTimeline } from "../derived/sampling-timeline";
import { buildTemperatureTables } from "../derived/temperature-table";
import type { TemperatureTables } from "../derived/temperature-table";

interface Params {
  basicInfo: ScheduleBasicInfoForm;
  sheets: SheetForm[];
  activeSheet: SheetForm | null;
  /** 활성 기록지의 미리보기 — `useSaveSheets` 가 이미 계산한 것을 다시 계산하지 않는다 */
  activePreviewCalc: SheetCalcPreview | null;
  externals: SheetCalcExternals;
}

/**
 * 비활성 기록지의 미리보기 캐시. 기록지 폼은 불변 갱신이라 참조가 같으면 내용도 같다 —
 * 편집 중에는 활성 기록지만 참조가 바뀌므로, 키 입력마다 모든 기록지를 다시 계산하지 않는다.
 * 키가 사라지면 항목도 함께 수거되는 WeakMap 이라 모듈 수준에 두어도 쌓이지 않는다.
 */
const previewCache = new WeakMap<SheetForm, { externals: SheetCalcExternals; preview: SheetCalcPreview }>();

const previewOf = (sheet: SheetForm, externals: SheetCalcExternals): SheetCalcPreview => {
  const cached = previewCache.get(sheet);
  if (cached && cached.externals === externals) return cached.preview;

  const preview = calcSheetPreview(toSheetSave(sheet), externals);
  previewCache.set(sheet, { externals, preview });
  return preview;
};

export interface SamplingTimelines {
  timeline: SamplingTimeline;
  /** 온도를 구간 시각과 함께 모은 표 */
  temperatures: TemperatureTables;
}

/**
 * 기록지 전체를 한 축에 올린 측정 시각 타임라인과, 같은 구간 시각을 쓰는 온도 표.
 *
 * 수분 종료시각은 기록지마다의 흡입량(vm_g)에서 나오므로 기록지별 미리보기 계산이 필요하다.
 * (effect 없이 파생만 — `use-save-sheets` 와 같은 원칙)
 */
export const useSamplingTimeline = ({
  basicInfo, sheets, activeSheet, activePreviewCalc, externals,
}: Params): SamplingTimelines | null =>
  useMemo(() => {
    if (sheets.length === 0) return null;

    const timeline = buildSamplingTimeline({
      basicInfo,
      sheets: sheets.map((sheet) => ({
        sheet,
        previewCalc: sheet === activeSheet ? activePreviewCalc : previewOf(sheet, externals),
      })),
    });
    return { timeline, temperatures: buildTemperatureTables(sheets, timeline.rows) };
  }, [basicInfo, sheets, activeSheet, activePreviewCalc, externals]);
