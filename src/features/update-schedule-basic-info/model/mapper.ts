import type { ScheduleMetaUpdate } from "@entities/schedule";
import { trimValue } from "@shared/lib";

import type { ScheduleBasicInfoUpdateForm } from "./types";

/**
 * 사전 정보 폼 → 계획 정의 수정 입력.
 * 측정분야와 측정 대상(측정시설·측정팀)은 생성 시점에만 정하므로 이 경로에 담기지 않는다.
 * 채취일자는 서버 필수값이라 validator 가 빈 값을 먼저 막는다.
 */
export const toScheduleMetaUpdate = (
  form: ScheduleBasicInfoUpdateForm,
): ScheduleMetaUpdate => ({
  sampledAt: form.measureDate,
  schedulePurpose: form.measurementType || null,
  referenceNumber: trimValue(form.referenceNumber) || null,
});
