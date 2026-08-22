import type { MeasurementCycle } from "@shared/model";

/**
 * 이번 계획에서 측정할 항목의 선택 상태.
 *
 * 다른 폼과 달리 숫자를 string 으로 두지 않는다 — 텍스트 입력이나 Select 를 거치지 않고
 * 목록의 id 를 체크로 토글할 뿐이라, 문자열 표현이 끼어들 자리가 없다.
 */
export type ScheduleItemsForm = {
  pollutantIds: number[];
};

/** 체크 목록 한 줄 — 측정시설 원장과 이 계획의 스냅샷을 합쳐 만든다. */
export type ScheduleItemOption = {
  pollutantId: number;
  nameKr: string;
  allowance: string;
  /** 기준산소농도 보정을 적용하는 항목인지. 적용하는 항목에만 표시를 붙인다 */
  oxygenApplicable: boolean;
  cycle: MeasurementCycle;
  /**
   * 측정시설에서는 빠졌지만 이 계획에는 남아 있는 항목.
   * 체크를 풀면 되살릴 수 없으므로 화면에서 따로 표시한다.
   */
  isRetired: boolean;
};

/** 측정주기별 묶음 — 상세 화면의 측정항목 카드와 같은 순서로 보여주기 위한 구조다. */
export type ScheduleItemGroup = {
  cycle: MeasurementCycle;
  label: string;
  options: ScheduleItemOption[];
};
