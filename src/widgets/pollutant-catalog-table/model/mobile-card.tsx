import type { MobileCardConfig } from '@shared/model';

import type { PollutantCatalogTableRow } from './types';

/**
 * 모바일 카드 배치. 데스크탑 컬럼 정의(`columns.ts`)와 독립적이다.
 * 좁은 화면에서는 상태 점을 그릴 자리가 없어 부제 문자열에 함께 싣는다.
 */
export const pollutantCatalogCardConfig: MobileCardConfig<PollutantCatalogTableRow> = {
  title: (row) => `${row.nameKr} (${row.code})`,
  subtitle: (row) => `${row.field} | ${row.method} | ${row.statusLabel}`,
};
