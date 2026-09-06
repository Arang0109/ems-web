import { useScheduleTable } from '../model/use-schedule-table';
import { scheduleCardConfig } from '../model/mobile-card';
import type { ScheduleTableRow } from '../model/types';

import { ScheduleFilterPopover } from './ScheduleFilterPopover';

import { BasicTable, TableEmptyState, TableFooterBar } from '@shared/ui/table';
import { Search, FilterSelect } from '@shared/ui/form';

import { Activity, CalendarDays, Users } from 'lucide-react';

interface Props {
  onRowClick?: (row: ScheduleTableRow) => void;
}

export const ScheduleTable = ({ onRowClick }: Props) => {
  const {
    table,

    globalFilter, setGlobalFilter,

    teamOptions,
    statusOptions,
    filter,

    isLoading, error,
  } = useScheduleTable();

  return (
    <div>
      {/* 모바일에서는 검색이 가용 폭을 채운다 (피그마 필터 바의 flex-1) */}
      <div className="mt-3 flex items-center gap-2">
        <Search className="w-full" filter={globalFilter} setFilter={setGlobalFilter} placeholder={'관리번호, 시설, 팀 검색'} />
        <FilterSelect
          icon={Users}
          options={teamOptions}
          value={filter.teamId}
          onValueChange={filter.changeTeam}
          placeholder="전체 팀"
          ariaLabel="팀 필터"
        />
        <FilterSelect
          icon={Activity}
          options={statusOptions}
          value={filter.status}
          onValueChange={filter.changeStatus}
          placeholder="전체 상태"
          ariaLabel="상태 필터"
        />
        <ScheduleFilterPopover
          range={filter.draftRange}
          preset={filter.draftPreset}
          activeCount={filter.activeFilterCount}
          onPresetSelect={filter.selectPreset}
          onRangeChange={filter.changeDraftRange}
          onApply={filter.apply}
          onReset={filter.reset}
          onOpen={filter.syncDraft}
        />
      </div>

      <div className="py-5 flex-1 flex flex-col">
        <BasicTable
          table={table}
          error={error}
          onRowClick={onRowClick}
          mobileCard={scheduleCardConfig}
          emptyState={
            <TableEmptyState
              icon={<CalendarDays className="size-5 text-muted-ink" />}
              label="조건에 맞는 측정계획이 없습니다."
              subLabel="기본 조회 범위는 오늘·내 팀입니다. 필터에서 기간이나 팀을 넓혀 보세요."
            />
          }
        />
      </div>

      {!isLoading && !error && (
        <TableFooterBar table={table} className="bg-canvas py-1" />
      )}
    </div>
  );
};
