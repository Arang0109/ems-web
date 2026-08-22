import type { MobileCardConfig } from '@shared/model';

import type { MemberTableRow } from './types';

/**
 * 모바일 카드 배치. 데스크탑 컬럼 정의(`columns.ts`)와 독립적이므로
 * 카드에 보여줄 항목·순서·라벨을 시안에 맞춰 자유롭게 구성한다.
 *
 * 피그마 카드 본문 6칸: 측정일 / 관리번호 / 측정분야 / 사업장 / 의뢰기관 / 배출구.
 * 시안 4번 칸은 "측정용도" 지만 현재 응답에 해당 필드가 없어 사업장으로 대체했다.
 */
export const memberCardConfig: MobileCardConfig<MemberTableRow> = {
  title: (row) => row.name,
  subtitle: (row) => row.department,
};
