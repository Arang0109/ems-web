import type { ClientSnapshotUpdate } from "@entities/schedule";
import { trimValue, toNumberOrNull } from "@shared/lib";

import type { ScheduleStackUpdateForm } from "./types";

/**
 * Form(string) → Domain. 측정시설은 의뢰기관 트리의 잎이라 스냅샷 수정 API가 같다
 * (`PATCH /schedules/{id}/client`). 의뢰기관·사업장 필드를 비워 보내면 서버가 기존 값을 유지하므로,
 * 이 폼은 `workplace.stack` 만 실어 다른 카드의 값을 건드리지 않는다.
 */
export const toStackSnapshotUpdate = (form: ScheduleStackUpdateForm): ClientSnapshotUpdate => ({
  workplace: {
    stack: {
      field: form.field,
      name: trimValue(form.name),
      semsNumber: trimValue(form.semsNumber),
      grade: form.grade,
      mainProduct: trimValue(form.mainProduct),
      // 서버가 nullable(Integer/Double)이므로 toNumber(빈값→0)가 아니라 toNumberOrNull을 쓴다.
      // 0으로 보내면 서버가 실제 0을 덮어써 산소보정계수 계산이 어긋난다.
      standardOxygen: toNumberOrNull(form.standardOxygen),
      height: toNumberOrNull(form.height),
      horizontalLength: toNumberOrNull(form.horizontalLength),
      // 원형은 세로 길이가 의미 없으므로 보내지 않는다(null = 기존 값 유지).
      verticalLength: form.shape === "RECTANGULAR" ? toNumberOrNull(form.verticalLength) : null,
      shape: form.shape,
      orientation: form.orientation,
    },
  },
});
