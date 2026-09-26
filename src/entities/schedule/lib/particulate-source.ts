import type { MeasurementCategory, MeasurementMode } from "@shared/model";

/**
 * 등속흡인 방식 항목이 채취되는 입자상 기록지 — 서버 `MeasurementCategory.particulateSourceOf` 와 같은 매핑.
 * 먼지·중금속·수은 기록지는 그 방식의 등속흡인 트레인 자체라 이름이 같다.
 *
 * 입자상 기록지(`particulateSampling`)는 pollutantId 를 갖지 않는다 — 트레인 하나가 무엇을 잡았는지는
 * 시트가 아니라 측정항목의 `mode` 가 정하므로, 시트와 항목을 잇는 유일한 키가 이 매핑이다.
 */
export const particulateSourceOf = (mode: MeasurementMode | null): MeasurementCategory | null => {
  switch (mode) {
    case "DUST": return "DUST";
    case "HEAVY_METAL": return "HEAVY_METAL";
    case "MERCURY": return "MERCURY";
    default: return null;
  }
};

export const isIsokineticMode = (mode: MeasurementMode | null): boolean => particulateSourceOf(mode) !== null;
