import type { MobileCardConfig } from '@shared/model';

import type { PollutantTableRow } from './types';

/**
 * 모바일 카드 배치. 데스크탑 컬럼 정의(`columns.ts`)와 독립적이므로
 * 카드에 보여줄 항목·순서·라벨을 시안에 맞춰 자유롭게 구성한다.
 */
export const pollutantCardConfig: MobileCardConfig<PollutantTableRow> = {
  title: (row) => `${row.nameKr} (${row.nameEn})`,
  subtitle: (row) => `${row.field} | ${row.method} | ${row.code}`,
};
