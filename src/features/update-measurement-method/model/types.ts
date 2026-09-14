import type { MeasurementMethod } from "@entities/measurement-method";
import type { SampleGrouping } from "@shared/model";

import { toFormValue } from "@shared/lib";

/**
 * 측정방법 수정 폼. 등록 폼과 같은 네 값이다 — 정렬 순서는 여기서 바꾸지 않는다.
 * 채취시간은 숫자 입력이라 Form 레이어에서는 문자열이다(빈 값 `""` = 미지정).
 */
export type MeasurementMethodUpdateForm = {
  name: string;
  sampleGrouping: SampleGrouping | "";
  mergedSampleName: string;
  samplingMinutes: string;
};

/** prop 은 useState 초기값으로만 쓴다 — 다시 열 때의 초기화는 부모의 key 리마운트가 담당한다. */
export const getDefaultForm = (method: MeasurementMethod | null): MeasurementMethodUpdateForm => ({
  name: method?.name ?? "",
  sampleGrouping: method?.sampleGrouping ?? "",
  mergedSampleName: method?.mergedSampleName ?? "",
  samplingMinutes: toFormValue(method?.samplingMinutes),
});
