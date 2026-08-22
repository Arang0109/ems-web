import type { MeasurementType } from "@shared/model";

/**
 * 사전 정보(측정계획 메타) 수정 폼.
 * 필드명은 register-schedule 의 등록 폼과 맞춘다 — 같은 값을 다루는 폼끼리 어긋나면 대조가 어렵다.
 * 항상 기존 값에서 출발하는 수정 폼이라 getDefault 초기값 생성 함수를 두지 않는다.
 */
export type ScheduleBasicInfoUpdateForm = {
  referenceNumber: string;              // 관리번호
  measureDate: string;                  // 측정일자 "yyyy-MM-dd"
  measurementType: MeasurementType | "";  // 측정용도 — 서버가 nullable 이라 미지정("")을 허용한다
};
