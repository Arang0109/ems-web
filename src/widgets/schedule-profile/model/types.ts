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

/** 측정항목 칩 하나 — 오염물질명 + 허용기준 + 산소보정 적용 여부 */
export type PollutantChipItem = {
  key: string;
  /** 정정 대상을 가리키는 축 — 측정계획 문서 안에서 측정물질은 유일하다 */
  pollutantId: number;
  /**
   * 측정시설 원장에 남아 있는 같은 항목의 id. 원장에서 삭제된 항목은 null 이며,
   * 그 경우 정정을 원장에 반영할 수 없다.
   */
  stackPollutantId: number | null;
  name: string;
  allowance: string;
  /** 산소보정의 기준이 되는 측정시설의 기준산소농도 표기(예: `O₂ 4%`). 없으면 빈 문자열 */
  standardOxygen: string;
  /** 기준산소농도 보정을 적용하는 항목인지. 적용하는 항목만 화면에 표시한다 */
  oxygenApplicable: boolean;
};

/**
 * 성적서에 실릴 측정항목 한 줄.
 *
 * 측정주기로 나누지 않은 **단일 평면 목록**이다 — 성적서의 항목 순서는 계획 전체에 대한
 * 하나의 순서이고, 그 순서가 곧 기록부 몇 번째 장 어느 칸에 들어갈지를 정하기 때문이다.
 * `id` 는 `SortableList` 가 요구하는 축이며 측정계획 문서 안에서 유일한 `pollutantId` 를 쓴다.
 */
export type ReportItem = {
  id: number;
  name: string;
  allowance: string;
  /** 산소보정의 기준이 되는 측정시설의 기준산소농도 표기. 없으면 "-" */
  standardOxygen: string;
  oxygenApplicable: boolean;
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
