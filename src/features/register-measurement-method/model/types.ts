import type { SampleGrouping } from "@shared/model";

/**
 * 측정방법 등록 폼.
 *
 * 채취 단위(`sampleGrouping`)가 핵심 입력이다 — 이 방법으로 잡는 항목들이 현장 기록지의 가스상 시료 표에
 * 어떻게 적히는지를 정한다. `MERGED`(한 병으로 함께 채취)일 때만 통칭명을 받는다.
 * 채취시간은 숫자 입력이라 Form 레이어에서는 문자열이다(빈 값 `""` = 미지정).
 */
export type MeasurementMethodRegisterForm = {
  name: string;
  sampleGrouping: SampleGrouping | "";
  mergedSampleName: string;
  samplingMinutes: string;
};

export const getDefaultForm = (): MeasurementMethodRegisterForm => ({
  name: "",
  sampleGrouping: "",
  mergedSampleName: "",
  samplingMinutes: "",
});
