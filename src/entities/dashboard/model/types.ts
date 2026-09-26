import type {
  MeasurementCountChartResponse, DashboardOverviewResponse,
  ExpiringContractResponse, InspectionDueResponse,
} from "../api/dto";

// 대시보드는 읽기 전용 집계라 응답 구조를 그대로 도메인으로 채택한다.

/** 월별 측정 완료 건수 한 점. */
export type MeasurementCount = MeasurementCountChartResponse;

/** 대시보드 요약 — 전체/이번달 통계와 만료 임박 목록. */
export type DashboardOverview = DashboardOverviewResponse;

/** 만료 임박 계약. `daysRemaining` 은 정의상 항상 0 이상이다. */
export type ExpiringContractItem = ExpiringContractResponse;

/** 검사 예정일 임박 장비-검사항목. `daysRemaining` 은 기한이 지났으면 음수다. */
export type InspectionDueItem = InspectionDueResponse;
