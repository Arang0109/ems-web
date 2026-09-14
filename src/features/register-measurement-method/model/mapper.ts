import type { MeasurementMethodCreate } from "@entities/measurement-method";

import type { MeasurementMethodRegisterForm } from "./types";

import { toNumberOrNull, trimValue } from "@shared/lib";
import type { SampleGrouping } from "@shared/model";

/**
 * Form → Domain.
 *
 * 통칭명은 `MERGED` 일 때만 실어 보낸다 — 다른 채취 단위에 통칭명이 남아 있으면 서버가 400 으로
 * 거부하므로, 사용자가 단위를 바꾸기 전에 적어 둔 값을 여기서 걸러낸다.
 * `sampleGrouping` 이 비어 있으면 호출부가 validator 로 이미 막았으므로 여기서는 변환만 한다.
 * `sortOrder` 는 보내지 않는다 — 서버가 목록 맨 뒤를 준다.
 */
export const toMeasurementMethodCreate = (form: MeasurementMethodRegisterForm): MeasurementMethodCreate => ({
  name: trimValue(form.name),
  sampleGrouping: form.sampleGrouping as SampleGrouping,
  mergedSampleName: form.sampleGrouping === "MERGED" ? (trimValue(form.mergedSampleName) || null) : null,
  samplingMinutes: toNumberOrNull(form.samplingMinutes),
  suctionFlowRate: toNumberOrNull(form.suctionFlowRate),
  sortOrder: null,
});
