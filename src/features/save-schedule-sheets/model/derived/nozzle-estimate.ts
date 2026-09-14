import type { NozzleRecommendation, SheetCalcExternals } from "@entities/schedule";
import { calcNozzleRecommendations } from "@entities/schedule";
import { toNumberOrNull } from "@shared/lib";

import { toSheetSave } from "../mapper";
import type { SheetSectionId } from "../sections";
import type { GasColumnKey, MoistureForm, SamplingPointForm, SheetForm } from "../types";
import { isFilled } from "../input/required-fields";

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

// ── 노즐 산정에 빠진 입력 ────────────────────────────────────────────────────

/** 노즐 산정에 필요한데 아직 비어 있는 입력 — 섹션 단위로 묶는다 */
export interface NozzleMissingGroup {
  /** 이동할 섹션. 장비 스냅샷(피토관·노즐경)은 기록지 밖이라 `null` */
  section: SheetSectionId | null;
  label: string;
  items: string[];
}

const isBlank = (value: string): boolean => !isFilled(value);

/**
 * 노즐 산정(`calcNozzleRecommendations`)이 결과를 내는 데 필요한 입력 중 비어 있는 것.
 *
 * 계산부는 서버 파리티 때문에 빈 입력을 **조용히** 건너뛴다 — 측정점 온도가 한 지점만 비어도
 * 평균을 0 으로 치고 진행하므로, 결과가 아예 안 나오거나 엉뚱한 값이 나온다. 그래서 계산부의
 * null 을 되짚지 않고 **입력 칸을 직접 본다** — 어느 칸을 채워야 하는지 이름으로 짚어 주기 위해서다.
 *
 * 항목의 근거는 k-Factor·오리피스차압·예상 채취시간 공식의 전제값이다:
 * Cp(피토관 계수·동압), Xw(수분량 전체 + 대기압), Md·Mw(O₂·CO₂·CO), Tg·Pv·Ps(전 지점),
 * Tm(DGM 온도 — 한 지점 이상), Pa(대기압), 노즐경 후보.
 */
export const getNozzleMissingInputs = (
  sheet: SheetForm,
  externals: SheetCalcExternals,
): NozzleMissingGroup[] => {
  const equipment: string[] = [];
  if (externals.nozzleDiameters.length === 0) equipment.push("노즐 장비의 노즐경");
  if (externals.pitotCoefficients.length === 0) equipment.push("피토관 계수");

  const weather: string[] = [];
  if (isBlank(sheet.weather.pressure)) weather.push("대기압");

  const moistureFields: [keyof MoistureForm, string][] = [
    ["weightBefore", "흡습병 무게 - 전"],
    ["weightAfter", "흡습병 무게 - 후"],
    ["gasMeterTempIn", "온도 - 입구"],
    ["gasMeterTempOut", "온도 - 출구"],
    ["dryGasVolumeBefore", "흡인량 - 전"],
    ["dryGasVolumeAfter", "흡인량 - 후"],
    ["gasMeterGaugePressure", "게이지압"],
  ];
  const moisture = moistureFields
    .filter(([key]) => isBlank(sheet.moisture[key]))
    .map(([, label]) => label);

  // 분자량(Md)은 세 성분 평균으로 계산한다 — 한 성분이 통째로 비면 0 으로 들어가 값이 틀어진다
  const gasColumns: [GasColumnKey, string][] = [["o2", "O₂"], ["co2", "CO₂"], ["co", "CO"]];
  const exhaust = gasColumns
    .filter(([key]) => sheet.exhaustGas[key].every(isBlank))
    .map(([, label]) => `${label} 농도 (1회 이상)`);

  const points = sheet.samplingPoints;
  const point: string[] = [];
  if (points.length === 0) point.push("측정점 (1개 이상)");
  const flowFields: [keyof SamplingPointForm, string][] = [["Ts", "배출가스 온도"], ["Pv", "동압"], ["Ps", "정압"]];
  points.forEach((p, i) => {
    const blank = flowFields.filter(([key]) => isBlank(p[key])).map(([, label]) => label);
    if (blank.length > 0) point.push(`${i + 1}지점 ${blank.join("·")}`);
  });
  // 가스미터 온도(Tm)는 지점 평균이라 한 지점만 있어도 계산된다
  const hasTm = points.some((p) => !isBlank(p.inTm) && !isBlank(p.outTm));
  if (points.length > 0 && !hasTm) point.push("DGM 입구·출구온도 (한 지점 이상)");

  const groups: NozzleMissingGroup[] = [
    { section: null, label: "측정장비", items: equipment },
    { section: "weather", label: "기상정보", items: weather },
    { section: "moisture", label: "수분량", items: moisture },
    { section: "exhaust", label: "배출가스", items: exhaust },
    { section: "point", label: "측정점", items: point },
  ];

  return groups.filter((group) => group.items.length > 0);
};
