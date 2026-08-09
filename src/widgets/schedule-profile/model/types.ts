import type { MeasurementCycle } from "@shared/model";

/**
 * 장비 사양 표시 항목.
 *
 * 값이 하나면 텍스트로, 여러 개면 칩으로 나열한다(피토관 계수·노즐 직경).
 * 표시 형태는 값의 개수가 아니라 항목 자체가 정하므로 두 형태를 타입으로 구분한다.
 */
export type EquipmentSpecItem =
  | { label: string; value: string }
  | { label: string; chips: string[] };

/** 측정항목 칩 하나 — 오염물질명 + 허용기준 */
export type PollutantChipItem = {
  key: string;
  name: string;
  allowance: string;
};

/**
 * 측정주기별 측정항목 묶음.
 *
 * `current` 는 이번 측정계획에 포함된 항목, `others` 는 같은 주기의 나머지 등록 항목이다.
 * 카드 헤더의 건수는 둘을 합친 수(= 측정시설에 등록된 해당 주기 항목 수)다.
 */
export type PollutantCycleGroup = {
  cycle: MeasurementCycle;
  label: string;
  current: PollutantChipItem[];
  others: PollutantChipItem[];
};
