import { Calendar } from 'lucide-react';

import { BasicTable, TableEmptyState, TableFooterBar } from '@shared/ui/table';
import { Panel } from '@shared/ui/cards';

import { useTeamScheduleTable } from '../model/use-team-schedule-table';

export const TeamScheduleTable = () => {
  const {
    table,
    teamName,
    isLoading, error,
  } = useTeamScheduleTable();

  return (
    <Panel className="p-0 flex flex-col">
      <header className="flex flex-wrap items-center gap-3 bg-canvas p-2">
        <h2 className="text-h3 text-foreground">
          {teamName ? `${teamName} 오늘 일정` : '팀별 측정 일정'}
        </h2>
      </header>

      {/* 컨텐츠 */}
      <div className="bg-canvas">
        <BasicTable
          table={table}
          error={error}
          emptyState={
            <TableEmptyState
              icon={<Calendar size={22} className="text-muted-foreground" />}
              label="오늘 예정된 측정 일정이 없습니다."
              subLabel={
                teamName
                  ? <span>{teamName}의 오늘 일정이 없습니다.<br />전체 일정은 측정 계획에서 확인하세요.</span>
                  : '전체 일정은 측정 계획에서 확인하세요.'
              }
            />
          }
        />
      </div>

      {/* 푸터: 건수 + 페이지네이션 */}
      {!isLoading && !error && (
        <TableFooterBar table={table} className="bg-canvas py-1" />
      )}
    </Panel>
  );
}
