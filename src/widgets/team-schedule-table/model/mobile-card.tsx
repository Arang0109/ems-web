import type { MobileCardConfig } from '@shared/model';

import type { TeamScheduleTableRow } from './types';

/**
 * 모바일 카드 배치. 데스크탑 컬럼 정의(`columns.ts`)와 독립적이므로
 * 카드에 보여줄 항목·순서·라벨을 시안에 맞춰 자유롭게 구성한다.
 *
 * 피그마 카드 본문 6칸: 측정일 / 관리번호 / 측정분야 / 의뢰기관 / 배출구.
 * 목록 응답에는 사업장명이 없다 — 사업장은 상세(스냅샷)에서만 확인한다.
 */
export const TeamScheduleCardConfig: MobileCardConfig<TeamScheduleTableRow> = {
  title: (row) => row.stackName,
};