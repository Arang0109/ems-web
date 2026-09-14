import type { SampleGrouping } from "@shared/model";

/**
 * 고객사 측정방법 한 건 — 서버 `MeasurementMethodResponse`.
 *
 * 측정방법은 채취 매체·방식(카트리지·흡착관·흡수액 …)이며, 고객사가 직접 관리하는 데이터다.
 * 채취 단위(`sampleGrouping`)·통칭 시료명(`mergedSampleName`)·표준 채취시간(`samplingMinutes`)은
 * 물질이 아니라 측정방법에 딸린 값이라 여기 있다 — 카트리지 채취시간을 한 번 바꾸면 카트리지로
 * 잡는 항목 전부에 반영된다.
 */
export type MeasurementMethodResponse = {
  id: number;
  name: string;
  sampleGrouping: SampleGrouping;
  /** `MERGED` 일 때만 값이 있다(예: `VOCs`) */
  mergedSampleName: string | null;
  /** 표준(계획) 채취시간, 분. 미지정이면 null */
  samplingMinutes: number | null;
  sortOrder: number | null;
};

/**
 * 등록. `sampleGrouping` 이 `MERGED` 면 `mergedSampleName` 이 필수이고, 그 외에는 비워야 한다
 * (서버 불변식, 어긋나면 400). `sortOrder` 를 비우면 목록 맨 뒤에 붙는다.
 */
export type MeasurementMethodRegisterRequest = {
  name: string;
  sampleGrouping: SampleGrouping;
  mergedSampleName: string | null;
  samplingMinutes: number | null;
  sortOrder: number | null;
};

/**
 * 수정. `name`·`sampleGrouping` 은 null 이면 기존 값 유지지만,
 * `mergedSampleName`·`samplingMinutes` 는 **보낸 값이 그대로 저장**된다(null = 비움).
 * "없음"이 유효한 값이라 null 을 유지로 읽으면 한번 채운 값을 비울 수 없기 때문이다.
 */
export type MeasurementMethodUpdateRequest = {
  name: string | null;
  sampleGrouping: SampleGrouping | null;
  mergedSampleName: string | null;
  samplingMinutes: number | null;
};
