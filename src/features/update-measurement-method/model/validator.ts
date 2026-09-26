import type { MeasurementMethodUpdateForm } from "./types";

export const validateMeasurementMethodUpdateFields = (form: MeasurementMethodUpdateForm) => {
  const errors: Partial<Record<keyof MeasurementMethodUpdateForm, string>> = {};

  if (!form.name.trim()) errors.name = "측정방법 이름을 입력해주세요.";
  if (!form.sampleGrouping) errors.sampleGrouping = "채취 단위를 선택해주세요.";
  if (form.sampleGrouping === "MERGED" && !form.mergedSampleName.trim()) {
    errors.mergedSampleName = "한 병으로 함께 채취하는 방법은 기록지에 적을 통칭명이 필요합니다.";
  }
  const minutes = form.samplingMinutes.trim();
  if (minutes && !/^\d+$/.test(minutes)) errors.samplingMinutes = "채취시간은 0 이상의 정수(분)로 입력해주세요.";
  const flowRate = form.suctionFlowRate.trim();
  if (flowRate && !/^\d+(\.\d+)?$/.test(flowRate)) errors.suctionFlowRate = "흡인유량은 0 이상의 숫자(L/min)로 입력해주세요.";

  return errors;
};
