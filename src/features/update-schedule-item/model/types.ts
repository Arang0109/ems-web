import type { MeasurementCycle } from "@shared/model";

/**
 * 측정항목 하나의 측정 조건 정정 폼.
 *
 * 허용기준은 텍스트 입력이므로 string 으로 둔다 — number 변환은 mapper(Form→Domain 경계)에서
 * 한 번만 일어난다. 빈 값은 0이 아니라 "미지정"(null)이다.
 */
export type ScheduleItemUpdateForm = {
  cycle: MeasurementCycle;
  allowance: string;
  oxygenApplicable: boolean;
  /**
   * 측정시설 원장(stack-pollutant)에도 같은 값을 반영할지.
   *
   * 현장에서 기준이 실제와 다름을 알았다면 대개 원장 쪽도 틀린 것이므로 기본값은 켬이다.
   * 끄면 이 회차 문서만 고쳐지고 다음 계획은 여전히 옛 기준으로 세워진다.
   */
  applyToStack: boolean;
};
