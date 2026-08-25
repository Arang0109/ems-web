import { MEASUREMENT_CATEGORY_LABEL } from "@shared/config";
import { formatNumber, toNumberOrNull } from "@shared/lib";

import type { AssignedPollutants } from "./measured-pollutants";
import { getMissingRequiredFields } from "./required-fields";
import { getVisibleSections } from "./section-progress";
import type { MoistureForm, SheetForm } from "./types";
import { isParticleCategory } from "./types";

// 시트 최소 유효성 — 측정점 1개 이상. 이것만 저장을 **막는다**(부분 저장 허용).
// 필수 미입력은 막지 않고 아래 describeMissingRequired 로 확인만 받는다.
export const validateSheetFields = (form: SheetForm): string[] => {
  const errors: string[] = [];

  const label = MEASUREMENT_CATEGORY_LABEL[form.category];
  if (form.samplingPoints.length === 0) {
    errors.push(`[${label}] 측정점을 1개 이상 입력해주세요.`);
  }

  return errors;
};

export interface MissingRequiredSummary {
  /** 비어 있는 필수 칸의 총 개수. 0 이면 확인을 물을 것이 없다 */
  total: number;
  /** 확인 다이얼로그에 실을 문구 — 기록지별 한 줄, 섹션별 개수 */
  description: string;
}

/**
 * 저장 직전에 "무엇이 비었는지" 한 문장으로 정리한다.
 *
 * 칸 이름을 낱낱이 세우지 않고 **섹션별 개수**로 접는 이유는, 미입력이 수십 개일 때
 * 이름을 다 늘어놓으면 다이얼로그가 스크롤 목록이 되어 아무도 읽지 않기 때문이다.
 * 어느 칸인지는 화면에서 빨강으로 짚어 준다 — 여기서는 규모만 알린다.
 */
export const describeMissingRequired = (
  sheets: SheetForm[],
  assigned: AssignedPollutants,
): MissingRequiredSummary => {
  let total = 0;
  const lines: string[] = [];

  for (const sheet of sheets) {
    const parts = getVisibleSections(isParticleCategory(sheet.category))
      .map((section) => ({
        label: section.label,
        count: getMissingRequiredFields(sheet, section.id, assigned).length,
      }))
      .filter((part) => part.count > 0);

    const sheetTotal = parts.reduce((sum, part) => sum + part.count, 0);
    if (sheetTotal === 0) continue;

    total += sheetTotal;
    const detail = parts.map((part) => `${part.label} ${part.count}`).join(" · ");
    lines.push(`${MEASUREMENT_CATEGORY_LABEL[sheet.category]} 기록지 ${sheetTotal}개 — ${detail}`);
  }

  return { total, description: lines.join("\n") };
};

/**
 * 흡습병 무게차(ma = 후 − 전)의 법정 허용 범위 (g).
 *
 * 범위를 벗어난 채취는 수분량 산정 근거로 쓸 수 없다. 값을 고쳐 될 일이 아니라 다시 채취해야
 * 하므로 **저장을 막지는 않고 경고만 한다** — 현장에서 실제로 잰 값은 기록에 남겨야 한다.
 */
export const MOISTURE_WEIGHT_GAIN_RANGE = { min: 0.1, max: 1 } as const;

/**
 * 경계값 비교에 두는 여유. `12.3 − 12.2` 가 `0.09999999999999964` 가 되는 부동소수 오차 때문에
 * 딱 0.1g 인 채취가 범위 밖으로 밀려나는 것을 막는다.
 */
const BOUNDARY_TOLERANCE = 1e-9;

export type MoistureWeightGainIssue = "tooSmall" | "tooLarge";

/** 흡습병 무게차(g). 전·후 중 하나라도 비어 있으면 `null` */
export const getMoistureWeightGain = (moisture: MoistureForm): number | null => {
  const before = toNumberOrNull(moisture.weightBefore);
  const after = toNumberOrNull(moisture.weightAfter);

  return before === null || after === null ? null : after - before;
};

/**
 * 흡습병 무게차가 법정 허용 범위를 벗어났는지.
 * 범위 안이거나 아직 판정할 수 없으면(전·후 미입력) `null`.
 */
export const checkMoistureWeightGain = (moisture: MoistureForm): MoistureWeightGainIssue | null => {
  const gain = getMoistureWeightGain(moisture);
  if (gain === null) return null;

  if (gain < MOISTURE_WEIGHT_GAIN_RANGE.min - BOUNDARY_TOLERANCE) return "tooSmall";
  if (gain > MOISTURE_WEIGHT_GAIN_RANGE.max + BOUNDARY_TOLERANCE) return "tooLarge";

  return null;
};

/** 허용 범위 표기 — 화면과 확인 다이얼로그가 같은 문구를 쓰도록 한곳에서 만든다 */
const RANGE_TEXT = `${MOISTURE_WEIGHT_GAIN_RANGE.min}~${MOISTURE_WEIGHT_GAIN_RANGE.max}g`;

/** 무게차 표기 — 뺄셈의 부동소수 잔여값(`0.14000000000000057`)을 그대로 노출하지 않는다 */
const gainText = (gain: number): string => `${formatNumber(gain, { maxDecimals: 3 })}g`;

export const describeMoistureWeightGain = (
  issue: MoistureWeightGainIssue,
  gain: number,
): string =>
  issue === "tooSmall"
    ? `흡습병 무게차가 ${MOISTURE_WEIGHT_GAIN_RANGE.min}g 미만입니다 (현재 ${gainText(gain)}). 법정 허용 범위는 ${RANGE_TEXT} 입니다.`
    : `흡습병 무게차가 ${MOISTURE_WEIGHT_GAIN_RANGE.max}g 을 초과했습니다 (현재 ${gainText(gain)}). 법정 허용 범위는 ${RANGE_TEXT} 입니다.`;

export interface MoistureWeightSummary {
  /** 범위를 벗어난 기록지 수. 0 이면 확인을 물을 것이 없다 */
  total: number;
  /** 확인 다이얼로그에 실을 문구 — 기록지별 한 줄 */
  description: string;
}

/**
 * 저장 직전에 **모든 기록지**의 흡습병 무게차를 훑는다.
 *
 * 화면의 경고는 활성 기록지 하나만 비추므로, 다른 탭에 열어 둔 기록지의 범위 이탈은
 * 여기서만 드러난다.
 */
export const describeMoistureWeightIssues = (sheets: SheetForm[]): MoistureWeightSummary => {
  const lines: string[] = [];

  for (const sheet of sheets) {
    const issue = checkMoistureWeightGain(sheet.moisture);
    const gain = getMoistureWeightGain(sheet.moisture);
    if (!issue || gain === null) continue;

    lines.push(
      `${MEASUREMENT_CATEGORY_LABEL[sheet.category]} 기록지 — 흡습병 무게차 ${gainText(gain)} (허용 ${RANGE_TEXT})`,
    );
  }

  return { total: lines.length, description: lines.join("\n") };
};
