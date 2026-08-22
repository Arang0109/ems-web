import type { MeasurementRecordListResponse } from "../api/dto";

/**
 * 완료된 측정계획 한 회차에서 측정항목 하나를 측정한 기록.
 * 키 구조가 서버 계약과 같아 재변환 없이 채택한다.
 */
export type MeasurementRecord = MeasurementRecordListResponse;
