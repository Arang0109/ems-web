import type { NozzleRecommendation, SheetCalcPreview } from "@entities/schedule";
import type { CalcResultItem } from "@shared/ui/form";

import { PARTICLE_HINT, WEATHER_HINT } from "../../model/field-hints";

/**
 * 계산 결과 드로어가 그리는 묶음들.
 *
 * 섹션 폼에는 **입력에 딸린 파생값 한 줄**(`CalcResultRow`, 예: 대기압 아래 mmHg 환산)만 남고,
 * **독립된 결과 묶음**(`CalcResultGrid`)은 전부 여기로 모인다. 값이 어느 섹션에서 왔는지가
 * 아니라 "무엇을 확인하려는가"로 묶어야 대조가 되기 때문이다.
 *
 * 배출가스 평균만 예외로 `sections/exhaust-gas-rows` 에 있다 — 입력 회차와 성분 순서·노출
 * 판정을 공유해야 해서다.
 */

/** 기상·수분량 — 둘 다 항목이 적고 함께 읽히므로 한 묶음으로 둔다 */
export const environmentItems = (preview: SheetCalcPreview | null): CalcResultItem[] => {
  const weather = preview?.weather ?? null;
  const moisture = preview?.moisture ?? null;

  return [
    {
      label: <>대기압 (P<sub>a</sub>)</>, value: weather?.pa, unit: "mmHg",
      hint: WEATHER_HINT.pressure, hintLabel: "대기압 환산 설명",
    },
    {label: <>수분량 (X<sub>w</sub>)</>, value: moisture?.xw, unit: "%",},
  ];
};

/** 유량 — 굴뚝 제원에서 나온 값과 지점 평균에서 나온 값이 함께 읽혀야 한다 */
export const flowItems = (preview: SheetCalcPreview | null): CalcResultItem[] => {
  const quantity = preview?.quantity ?? null;

  return [
    { label: "연도 단면적", value: quantity?.area, unit: "m²" },
    {
      label: "규정 요구 측정점 수", value: preview?.samplingPointCnt,
      hint: PARTICLE_HINT.requiredPointCount, hintLabel: "규정 요구 측정점 수 설명",
    },
    { label: "평균 유속", value: quantity?.Vs, unit: "m/s", hint: PARTICLE_HINT.gasVelocity },
    { label: "피토우관 계수", value: quantity?.Cp, hint: PARTICLE_HINT.Cp },
    { label: "배출가스 밀도", value: quantity?.gasDensity, hint: PARTICLE_HINT.gasDensity },
    { label: "습윤 유량", value: quantity?.quantity, unit: "m³/hr", hint: PARTICLE_HINT.quantity },
    {
      label: "표준 유량", value: quantity?.standardQuantity,
      unit: "Sm³/hr", hint: PARTICLE_HINT.standardQuantity, hintLabel: "표준 유량 설명",
    },
  ];
};

/** 선택한 노즐 기준의 산정 예상치 — 실측이 아니라 프론트 추정이라 실측 평균과 갈라 둔다 */
export const nozzleEstimateItems = (estimate: NozzleRecommendation | null): CalcResultItem[] => [
  {
    label: "예상 오리피스차압", value: estimate?.orificeDp, unit: "mmH₂O",
    hint: PARTICLE_HINT.estimatedOrificeDp,
  },
  {
    label: "예상 채취시간", value: estimate?.samplingTime, unit: "min",
    hint: PARTICLE_HINT.estimatedSamplingTime,
  },
  {
    label: "예상 채취량", value: estimate?.Vm, unit: "m³",
    hint: PARTICLE_HINT.estimatedVm,
  },
];
