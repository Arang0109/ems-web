import type { SampleGrouping } from "@shared/model";

/**
 * 고객사가 측정물질에 쓰는 측정방법(채취 매체·방식).
 *
 * 한때 전역 열거값(`MeasurementMethod`)이었으나 고객사 소유 데이터가 됐다. 채취 단위·통칭 시료명·
 * 표준 채취시간이 물질이 아니라 **측정방법에 딸린 값**이라, 물질마다 반복 저장하면 카트리지 항목
 * 전부를 동기화해야 하기 때문이다. 측정물질은 `methodId` 로 참조만 한다.
 *
 * - `sampleGrouping` — 현장 기록지의 가스상 시료 표에 행을 어떻게 적는가.
 *   `MERGED` 는 그 방법의 항목 전부를 `mergedSampleName` 한 행으로(흡착관 `VOCs-T`·카트리지 `VOCs`),
 *   `PER_ITEM` 은 항목마다 한 행(흡수액·테드라백), `NONE` 은 행을 만들지 않는다(먼지·중금속·수은·현장측정).
 * - `samplingMinutes` — 표준(계획) 채취시간. 회차별 실측 시각은 측정계획이 따로 갖는다.
 */
export type MeasurementMethod = {
  id: number;
  name: string;
  sampleGrouping: SampleGrouping;
  /** `MERGED` 일 때만 값이 있다. 그 외는 빈 문자열 */
  mergedSampleName: string;
  /** 표준 채취시간(분). 미지정은 null 로 구분한다 — 0분과 다르다 */
  samplingMinutes: number | null;
  sortOrder: number | null;
};

/**
 * 등록 입력. `MERGED` 면 통칭명이 필수이고 그 외에는 null 이어야 한다(서버 불변식).
 * `sortOrder` 는 비우면(null) 서버가 목록 맨 뒤를 준다.
 */
export type MeasurementMethodCreate = {
  name: string;
  sampleGrouping: SampleGrouping;
  mergedSampleName: string | null;
  samplingMinutes: number | null;
  sortOrder: number | null;
};

/**
 * 수정 입력. `name`·`sampleGrouping` 은 null 이면 유지되지만
 * **`mergedSampleName`·`samplingMinutes` 는 보낸 값이 그대로 저장된다** — null 은 "비운다"는 뜻이다.
 * 폼은 항상 자기 필드 전부를 보내므로 이 차이가 화면에 드러나지는 않는다.
 */
export type MeasurementMethodUpdate = {
  name: string | null;
  sampleGrouping: SampleGrouping | null;
  mergedSampleName: string | null;
  samplingMinutes: number | null;
};
