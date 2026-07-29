import type { ScheduleEquipmentsUpdate } from "@entities/schedule";
import { trimValue } from "@shared/lib";

import type { ScheduleEquipmentsUpdateForm } from "./types";

// 빈 슬롯은 null로 보낸다. 서버는 null/blank를 "기존 장비 유지"로 해석하므로
// 배정을 해제하는 수단은 아니다.
const toId = (value: string): string | null => trimValue(value) || null;

export const toScheduleEquipmentsUpdate = (
  form: ScheduleEquipmentsUpdateForm,
): ScheduleEquipmentsUpdate => ({
  particleSamplerId: toId(form.particleSamplerId),
  gasSamplerId: toId(form.gasSamplerId),
  pitotTubeId: toId(form.pitotTubeId),
  nozzleId: toId(form.nozzleId),
});
