import type { Pollutant } from "@entities/pollutant";

/**
 * 편집 가능한 값만 담는다. id·code·측정분야·측정방법·형태는 가이드가 소유하거나 정체성이라
 * 사용자가 바꿀 수 없으므로 폼 상태로 복제하지 않는다(`pollutant` prop 이 가지고 있다).
 */
export type PollutantUpdateForm = {
  nameKr: string;
  nameEn: string;
  equipment: string;
  testMethod: string;
};

/** prop 은 useState 초기값으로만 쓴다 — 다시 열 때의 초기화는 부모의 key 리마운트가 담당한다. */
export const getDefaultForm = (pollutant: Pollutant | null): PollutantUpdateForm => ({
  nameKr: pollutant?.nameKr ?? "",
  nameEn: pollutant?.nameEn ?? "",
  equipment: pollutant?.equipment ?? "",
  testMethod: pollutant?.testMethod ?? "",
});
