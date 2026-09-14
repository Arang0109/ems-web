import type { Pollutant } from "@entities/pollutant";

import { toFormValue } from "@shared/lib";

/**
 * 편집 가능한 값만 담는다. id·code·측정분야·형태는 가이드가 소유하거나 정체성이라
 * 사용자가 바꿀 수 없으므로 폼 상태로 복제하지 않는다(`pollutant` prop 이 가지고 있다).
 * 측정방법은 고객사 소유값이라 편집한다 — 측정방법이 정해지지 않은 레거시 행은 비어 있다(미선택 `""`).
 * Select 값이라 id 를 문자열로 들고 있다가 제출 시 숫자로 바꾼다.
 * `samplingMinutes` 는 항목별 채취시간 오버라이드다 — 비우면 측정방법 표준값으로 되돌아간다(서버가 그대로 저장).
 */
export type PollutantUpdateForm = {
  methodId: string;
  samplingMinutes: string;
  nameKr: string;
  nameEn: string;
  equipment: string;
  testMethod: string;
};

/** prop 은 useState 초기값으로만 쓴다 — 다시 열 때의 초기화는 부모의 key 리마운트가 담당한다. */
export const getDefaultForm = (pollutant: Pollutant | null): PollutantUpdateForm => ({
  methodId: pollutant?.methodId != null ? String(pollutant.methodId) : "",
  samplingMinutes: toFormValue(pollutant?.samplingMinutes),
  nameKr: pollutant?.nameKr ?? "",
  nameEn: pollutant?.nameEn ?? "",
  equipment: pollutant?.equipment ?? "",
  testMethod: pollutant?.testMethod ?? "",
});
