import type { PollutantCatalog } from "@entities/pollutant-catalog";
import type { MeasurementField, MeasurementMethod, PollutantPhase } from "@shared/model";
import { toFormValue } from "@shared/lib";

/**
 * `code` 는 서버가 수정 대상에서 제외하므로 폼에 두지 않는다 — 읽기 전용 표시는
 * `catalog` prop 에서 직접 읽는다.
 */
export type PollutantCatalogUpdateForm = {
  field: MeasurementField;
  nameKr: string;
  method: MeasurementMethod | "";
  phase: PollutantPhase | "";
  sortOrder: string;
};

/** prop 은 useState 초기값으로만 쓴다 — 다시 열 때의 초기화는 부모의 key 리마운트가 담당한다. */
export const getDefaultForm = (catalog: PollutantCatalog | null): PollutantCatalogUpdateForm => ({
  field: catalog?.field ?? "AIR",
  nameKr: catalog?.nameKr ?? "",
  method: catalog?.method ?? "",
  phase: catalog?.phase ?? "",
  // String(null) 이 "null" 문자열로 새는 것을 막는다 (루트 CLAUDE.md 의 toFormValue 규칙)
  sortOrder: toFormValue(catalog?.sortOrder ?? null),
});
