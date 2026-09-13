import type { ReactNode } from "react";

import type { SheetCalcPreview } from "@entities/schedule";
import { toNumberOrNull } from "@shared/lib";
import type { CalcResultItem } from "@shared/ui/form";

import { POINT_RESULT_HINT } from "../../../model/field-hints";
import type { SamplingPointForm } from "../../../model/types";
import { FLOW_FIELDS, ISOKINETIC_FIELDS, type PointField } from "./point-fields";

/** 값이 없으면 `-`. 표기는 표시하는 쪽이 정하므로 계산부는 원값을 그대로 돌려준다. */
export const display = (value: number | null | undefined): string =>
  value == null ? "-" : String(value);

/** 지점별 계산 결과 한 행 — 입력이 아니라 파생값이다. */
export interface PointResult {
  label: ReactNode;
  /** 라벨이 JSX 라 문자열이 필요한 자리(도움말 접근성 이름) */
  name: string;
  hint: string;
  unit?: string;
  value: (index: number) => number | null | undefined;
  avg: number | null | undefined;
}

/** 모바일 평균 카드와 데스크탑 표가 공유하는 그룹 구성 — 입력 행 + 결과 행 */
export interface PointGroup {
  label: string;
  fields: PointField[];
  results: PointResult[];
}

// 표시 전용 입력값 평균 (DGM 온도 행의 평균열) — 입력된 값만, 소수 1자리.
const avgOfInputs = (values: string[]): number | null => {
  const nums = values.map(toNumberOrNull).filter((v): v is number => v !== null);
  if (nums.length === 0) return null;

  return Math.round((nums.reduce((a, v) => a + v, 0) / nums.length) * 10) / 10;
};

/**
 * 지점별 입력값의 평균. 계산 미리보기가 제공하는 값이 있으면 그것을, 없으면 입력 평균을 쓴다.
 * 평균이 의미 없는 항목(적산값·게이지압 등)은 `null` 이다.
 */
export const averageOf = (
  field: keyof SamplingPointForm,
  points: SamplingPointForm[],
  preview: SheetCalcPreview | null,
): number | null | undefined => {
  const quantity = preview?.quantity ?? null;

  switch (field) {
    case "Ts": return quantity?.avgTg == null ? null : quantity.avgTg - 273;
    case "Pv": return quantity?.avgPv;
    case "Ps": return quantity?.avgPs;
    case "samplingTime": return preview?.particle?.totalSamplingTime;
    case "inTm":
    case "outTm": return avgOfInputs(points.map((p) => p[field]));
    default: return null;
  }
};

/**
 * 등속흡인 자동계산 (입자상 전용) — 채취량(V<sub>m</sub>)은 뺀다.
 * 모바일 카드에서 채취량은 입력 사이에 끼는 행이라 이 묶음과 표시 위치가 다르다.
 */
export const isokineticResults = (preview: SheetCalcPreview | null): PointResult[] => {
  const particle = preview?.particle ?? null;
  const at = (index: number) => preview?.points[index] ?? null;

  return [
    {
      label: "오리피스 차압 (ΔH)", name: "오리피스 차압", hint: POINT_RESULT_HINT.orificeDp,
      value: (i) => at(i)?.orificeDp, avg: particle?.avgOrificeDp,
    },
    {
      label: "K-Factor", name: "K-Factor", hint: POINT_RESULT_HINT.kFactor,
      value: (i) => at(i)?.kFactor, avg: particle?.avgKFactor,
    },
    {
      label: "등속흡입계수 (I, %)", name: "등속흡입계수", hint: POINT_RESULT_HINT.isokineticRatio,
      value: (i) => at(i)?.isokineticRatio, avg: particle?.avgIsokineticRatio,
    },
  ];
};

/** 채취량 — 등속흡인 그룹의 첫 결과 행이자, 카드에서 입력 사이에 끼어드는 값 */
export const vmResult = (preview: SheetCalcPreview | null): PointResult => ({
  label: <span>실제 채취량 (V<sub>m</sub>)</span>, name: "채취량", hint: POINT_RESULT_HINT.Vm,
  value: (i) => preview?.points[i]?.Vm, avg: preview?.particle?.totalVm,
});

/**
 * 표·계산값 드로어의 그룹 구성. 모바일 카드의 그룹 순서와 같은 소스를 쓴다 —
 * 두 표현이 어긋나면 "지점 간 값 비교" 라는 이 섹션의 목적이 깨진다.
 */
export const buildPointGroups = (
  isParticle: boolean,
  preview: SheetCalcPreview | null,
): PointGroup[] => [
  { label: "유량 정보", fields: FLOW_FIELDS, results: [] },
  ...(isParticle
    ? [{
      label: "등속흡인 정보",
      fields: ISOKINETIC_FIELDS,
      results: [vmResult(preview), ...isokineticResults(preview)],
    }]
    : []),
];

/** `PointResult` → `CalcResultGrid` 항목. 지점별 값(`index` 지정)과 평균(생략) 두 쓰임을 함께 덮는다. */
export const toResultItems = (results: PointResult[], index?: number): CalcResultItem[] =>
  results.map((r) => ({
    label: index === undefined ? <>{r.label} 평균</> : r.label,
    value: index === undefined ? r.avg : r.value(index),
    unit: r.unit,
    hint: r.hint,
    hintLabel: `${r.name} 설명`,
  }));

/**
 * 측정지점 평균 한 그룹 — 입력값 평균에 그룹의 결과 평균을 이어 붙인다.
 *
 * 모바일 카드에 있던 `측정지점 평균` 블록이 계산값 드로어로 옮겨 오면서 여기로 모였다.
 * 데스크탑 전치 표의 `평균` 열은 그대로 남는다 — 그쪽은 지점 값과 나란히 놓인 파생 셀이라
 * 입력을 보며 대조하는 자리이고, 이 묶음은 입력에서 떼어 낸 결과다.
 *
 * 평균이 성립하지 않는 항목(가스미터 적산값·게이지압 등)은 `—` 로 남긴다 —
 * 표의 `평균` 열과 같은 판정(`averageOf`)을 쓰므로 두 표현이 어긋나지 않는다.
 */
export const pointAverageItems = (
  group: PointGroup,
  points: SamplingPointForm[],
  preview: SheetCalcPreview | null,
): CalcResultItem[] => [
  ...group.fields.map((f) => ({
    label: <>{f.label}</>,
    value: averageOf(f.field, points, preview),
    unit: f.unit,
  })),
  ...toResultItems(group.results),
];
