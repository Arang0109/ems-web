import type { NozzleRecommendation, SheetCalcExternals } from "@entities/schedule";
import { calcNozzleRecommendations } from "@entities/schedule";
import { toNumberOrNull } from "@shared/lib";

import { toSheetSave } from "./mapper";
import type { SheetForm } from "./types";

/**
 * 적정 노즐사이즈 산정 결과의 폼 레이어 어댑터.
 *
 * 추천 모달과 "선택한 노즐의 예상치" 표시가 **같은 목록을 공유**한다 —
 * 모달에서 고른 뒤에도 같은 기준(희망 흡입량)으로 계산된 값을 계속 볼 수 있어야 하고,
 * 시트 입력이 바뀌면 예상치도 함께 따라와야 하기 때문이다.
 */

/** 희망 흡입량 기본값 (m³, 표준상태) */
export const DEFAULT_TARGET_VOLUME = "1";

export const calcNozzleEstimates = (
  sheet: SheetForm,
  externals: SheetCalcExternals,
  targetVolume: string,
): NozzleRecommendation[] =>
  calcNozzleRecommendations(toSheetSave(sheet), externals, toNumberOrNull(targetVolume));

/** 현재 선택된 노즐경의 예상치. 미선택이거나 목록에 없으면 null. */
export const findNozzleEstimate = (
  estimates: NozzleRecommendation[],
  nozzleSize: string,
): NozzleRecommendation | null => {
  const size = toNumberOrNull(nozzleSize);
  if (size == null) return null;
  return estimates.find((r) => r.nozzleSize === size) ?? null;
};
