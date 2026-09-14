export type MeasurementMethodTableRow = {
  /** 측정방법 id. 상세 모달 대상 지목에 쓴다 */
  id: number;
  name: string;
  /** 채취 단위 라벨 */
  sampleGrouping: string;
  /** 통칭명. 통칭 채취가 아니면 EMPTY */
  mergedSampleName: string;
  /** `30분` 표기. 미지정은 EMPTY */
  samplingMinutes: string;
};
