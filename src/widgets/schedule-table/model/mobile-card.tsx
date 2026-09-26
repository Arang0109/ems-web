import type { MobileCardConfig } from '@shared/model';
import { Badge } from '@shared/ui/badges';

import { StatusPill } from '../ui/Cells';
import { ScheduleCardBody } from '../ui/ScheduleCardBody';
import type { ScheduleTableRow } from './types';

/**
 * 모바일 카드 배치. 데스크탑 컬럼 정의(`columns.ts`)와 독립적이므로
 * 카드에 보여줄 항목·순서·라벨을 시안에 맞춰 자유롭게 구성한다.
 *
 * 본문은 라벨/값 격자가 아니라 관리번호를 키로 세운 배치라 `fields` 대신 `body` 를 쓴다.
 * 오늘 측정 건은 배지와 테두리 두 가지로 표시한다 — 목록을 훑을 때 오늘 것이 먼저 잡혀야 한다.
 */
export const scheduleCardConfig: MobileCardConfig<ScheduleTableRow> = {
  badge: (row) => (row.isToday ? <Badge tone="brand-solid" size="sm">오늘</Badge> : null),
  highlight: (row) => row.isToday,
  title: (row) => row.stackName,
  titleClassName: 'text-h2',
  subtitle: (row) => `${row.clientName} - ${row.teamName}`,
  status: (row) => <StatusPill status={row.status} />,
  body: (row, table) => <ScheduleCardBody row={row} table={table} />,
};
