import type { MeasurementMethodUpdate } from "@entities/measurement-method";

import type { MeasurementMethodUpdateForm } from "./types";

import { toNumberOrNull, trimValue } from "@shared/lib";

/**
 * Form → Domain.
 *
 * 서버는 `name`·`sampleGrouping` 을 null 이면 유지로 읽지만, **통칭명·채취시간은 보낸 값을 그대로
 * 저장**한다(null = 비움). 폼이 네 값을 전부 들고 있으므로 이 차이가 화면에 드러나지는 않는다 —
 * 채취시간 칸을 비우면 실제로 비워진다는 것만 기억하면 된다.
 *
 * 통칭명은 `MERGED` 일 때만 실어 보낸다. 통칭 채취를 항목별 채취로 바꾸는 요청은 서버 규약상
 * 통칭명을 함께 비워야 하는데, 사용자가 예전 통칭명을 지우지 않았어도 여기서 걸러 그 요청이 된다.
 */
export const toMeasurementMethodUpdate = (form: MeasurementMethodUpdateForm): MeasurementMethodUpdate => ({
  name: trimValue(form.name) || null,
  sampleGrouping: form.sampleGrouping || null,
  mergedSampleName: form.sampleGrouping === "MERGED" ? (trimValue(form.mergedSampleName) || null) : null,
  samplingMinutes: toNumberOrNull(form.samplingMinutes),
});
