import type { ScheduleMetaUpdate, TenantSnapshot } from "@entities/schedule";
import { trimValue } from "@shared/lib";

import type { ScheduleBasicInfoUpdateForm } from "./types";

/**
 * 사전 정보 폼 → 메타 수정 입력.
 * 이 화면이 다루지 않는 측정분야는 entity mapper 가 null(기존 값 유지)로 채운다.
 */
export const toScheduleMetaUpdate = (
  form: ScheduleBasicInfoUpdateForm,
  tenant: TenantSnapshot | null,
): ScheduleMetaUpdate => ({
  sampledAt: form.measureDate || null,
  schedulePurpose: form.measurementType || null,
  referenceNumber: trimValue(form.referenceNumber) || null,
  // 서버가 tenant 만 "null = 덮어쓰기"로 처리한다 — 조회한 값을 되돌려 보내지 않으면
  // 고객사 스냅샷이 지워져 성적서 발행이 깨진다.
  tenant,
});
