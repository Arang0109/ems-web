import type { ReactNode } from "react";

import type { SheetCalcPreview } from "@entities/schedule";
import type { CalcResultItem } from "@shared/ui/form";

import { EXHAUST_GAS_HINT } from "../../model/field-hints";
import type { ExhaustGasVisibility } from "../../model/measured-pollutants";
import type { GasColumnKey } from "../../model/types";

/**
 * 배출가스 성분 스펙 — **입력 회차(`ExhaustGasSection`)와 평균 묶음(계산 결과 드로어)이 공유한다.**
 *
 * 두 곳이 각자 성분을 나열하면 한쪽만 고쳐져 어긋난다. 특히 NOx·SOx 는 측정항목 배정에 따라
 * 나왔다 들어갔다 하므로 순서·노출 판정을 한 소스에서 뽑아야 한다.
 */
export interface GasRow {
  key: GasColumnKey;
  label: ReactNode;
  unit: string;
  avgKey: keyof SheetCalcPreview["exhaustGas"];
}

// 가스분석기가 항상 읽는 3성분
const BASE_GAS_ROWS: GasRow[] = [
  { key: "o2", label: "O₂", unit: "%", avgKey: "o2Avg" },
  { key: "co2", label: "CO₂", unit: "%", avgKey: "co2Avg" },
  { key: "co", label: "CO", unit: "%", avgKey: "coAvg" },
];

// 측정항목에 배정됐을 때만 노출한다. 3성분과 달리 단위가 ppm 이다.
const OPTIONAL_GAS_ROWS: Record<"nox" | "sox", GasRow> = {
  nox: { key: "nox", label: "NOx", unit: "ppm", avgKey: "noxAvg" },
  sox: { key: "sox", label: "SOx", unit: "ppm", avgKey: "soxAvg" },
};

/** 입력 회차에 세울 성분 행 — 3성분 → NOx → SOx 순서 */
export const visibleGasRows = (visiblePollutants: ExhaustGasVisibility): GasRow[] => [
  ...BASE_GAS_ROWS,
  ...(visiblePollutants.nox ? [OPTIONAL_GAS_ROWS.nox] : []),
  ...(visiblePollutants.sox ? [OPTIONAL_GAS_ROWS.sox] : []),
];

/**
 * 평균 자동계산 묶음.
 *
 * 순서는 3성분 → N₂ → NOx·SOx → 표준산소·보정계수·밀도다. N₂ 가 3성분 바로 뒤인 것은
 * 100 − (O₂+CO₂+CO) 라서 앞의 셋과 함께 읽어야 하기 때문이다.
 */
export const exhaustGasAvgItems = (
  calc: SheetCalcPreview["exhaustGas"] | null,
  standardOxygen: number | null,
  visiblePollutants: ExhaustGasVisibility,
): CalcResultItem[] => {
  const optionalRows = [
    ...(visiblePollutants.nox ? [OPTIONAL_GAS_ROWS.nox] : []),
    ...(visiblePollutants.sox ? [OPTIONAL_GAS_ROWS.sox] : []),
  ];

  return [
    ...BASE_GAS_ROWS.map((row) => ({
      label: <>{row.label}</>,
      value: calc?.[row.avgKey] as number | null | undefined,
      unit: row.unit,
    })),
    {
      label: "N₂", value: calc?.n2, unit: "%",
      hint: EXHAUST_GAS_HINT.n2, hintLabel: "N2 평균 설명",
    },
    ...optionalRows.map((row) => ({
      label: row.label,
      value: calc?.[row.avgKey] as number | null | undefined,
      unit: row.unit,
    })),
    {
      label: "표준산소농도", value: standardOxygen, unit: "%",
      hint: EXHAUST_GAS_HINT.standardOxygen,
    },
    {
      label: "산소보정계수", value: calc?.o2CorrectionFactor,
      hint: EXHAUST_GAS_HINT.o2CorrectionFactor,
    },
    {
      label: "배출가스밀도(ρ)", value: calc?.standardGasDensity, unit: "kg/Sm³",
      hint: EXHAUST_GAS_HINT.standardGasDensity, hintLabel: "표준상태 배출가스밀도 설명",
    },
  ];
};
