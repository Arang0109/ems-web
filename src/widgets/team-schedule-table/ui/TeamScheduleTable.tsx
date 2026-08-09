import type { Workplace } from '@entities/workplace';
import type { ScheduleListItem } from '@entities/schedule';

import { Calendar } from 'lucide-react';

import { BasicTable, TableEmptyState, TableFooterBar } from '@shared/ui/table';
import { Panel } from '@shared/ui/cards';
import { useTeamScheduleTable } from '../model/use-team-schedule-table';

interface Props {
  schedules: ScheduleListItem[];
  loading: boolean;
  error: string | null;
  selectedWorkplace: Workplace | null;
  onSuccess?: () => void;
}

export const TeamScheduleTable = ({
  schedules, loading, error, selectedWorkplace
}: Props) => {
  const {
    table
  } = useTeamScheduleTable({ schedules });

  return (
    <Panel className="p-0 flex flex-col">
      <header className="flex flex-wrap items-center gap-3 bg-canvas p-2">
        <h2 className="text-h3 text-foreground">팀별 측정 일정</h2>
      </header>

      {/* 컨텐츠 */}
      <div className="bg-canvas">
        {!selectedWorkplace ? (
          <TableEmptyState
            icon={<Calendar size={22} className="text-muted-foreground" />}
            label='일정 없음'
            subLabel={<span>위쪽에서 팀을 선택하면<br />해당 팀의 측정 일정이 표시됩니다.</span>}
          />
        ) : (
          <BasicTable table={table} error={error} />
        )}
      </div>

      {/* 푸터: 건수 + 페이지네이션 */}
      {!loading && !error && (
        <TableFooterBar table={table} className="bg-canvas py-1" />
      )}
    </Panel>
  );
}
