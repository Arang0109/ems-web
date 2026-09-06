import type { ScheduleEquipmentsUpdate } from "@entities/schedule";
import { trimValue } from "@shared/lib";

import type { ScheduleEquipmentsUpdateForm } from "./types";

// 서버는 전달한 목록으로 장비를 전체 교체한다 — 빈 슬롯은 목록에서 빠지고, 그것이 곧 배정 해제다.
const toId = (value: string): string | null => trimValue(value) || null;

/**
 * @param keepIds 이 폼이 다루지 않는 유형(가스분석기·기타)의 장비 id.
 *   전체 교체 계약이므로 함께 실어 보내지 않으면 폼 밖에서 배정된 장비가 조용히 사라진다.
 *   관리 유형 목록은 `MANAGED_EQUIP_TYPES`(./types) 가 소유한다.
 */
export const toScheduleEquipmentsUpdate = (
  form: ScheduleEquipmentsUpdateForm,
  keepIds: string[] = [],
): ScheduleEquipmentsUpdate => ({
  equipmentIds: [
    ...[form.particleSamplerId, form.gasSamplerId, form.pitotTubeId, form.nozzleId]
      .map(toId)
      .filter((id): id is string => id !== null),
    ...keepIds,
  ],
});
