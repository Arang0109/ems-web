import type { MeasurementField } from "@shared/model";

/**
 * 채택 목록과 채택 후보는 한 쪽을 바꾸면 반드시 다른 쪽도 바뀐다(후보를 채택하면 후보에서 빠지고
 * 목록에 들어온다). 그래서 같은 `all` 아래 두어 상위 키 하나로 함께 무효화한다.
 */
export const pollutantKeys = {
  all: ["pollutant"] as const,
  lists: () => [...pollutantKeys.all, "list"] as const,
  list: (field?: MeasurementField) => [...pollutantKeys.lists(), field ?? null] as const,
  candidateLists: () => [...pollutantKeys.all, "candidate"] as const,
  candidates: (field?: MeasurementField) => [...pollutantKeys.candidateLists(), field ?? null] as const,
};
