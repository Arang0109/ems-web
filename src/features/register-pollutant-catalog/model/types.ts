import type { MeasurementField, MeasurementMethod, PollutantPhase } from "@shared/model";

/**
 * 법정 측정물질 카탈로그 등록 폼.
 *
 * `sortOrder` 는 숫자량이지만 텍스트 입력의 동작(빈 문자열)과 맞추기 위해 폼에서는 문자열로 둔다
 * (루트 CLAUDE.md 의 숫자 타입 처리 규칙). `method`·`phase` 는 선택 항목이라 미선택(`""`)이 있다.
 */
export type PollutantCatalogRegisterForm = {
  code: string;
  field: MeasurementField;
  nameKr: string;
  method: MeasurementMethod | "";
  phase: PollutantPhase | "";
  sortOrder: string;
};

export const getDefaultForm = (): PollutantCatalogRegisterForm => ({
  code: "",
  field: "AIR",
  nameKr: "",
  method: "",
  phase: "",
  sortOrder: "",
});
