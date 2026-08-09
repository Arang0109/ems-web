import { useScheduleTable } from '../model/use-schedule-table';
import { scheduleCardConfig } from '../model/mobile-card';
import type { ScheduleTableRow } from '../model/types';

import { BasicTable, TableFooterBar } from '@shared/ui/table';
import { Button } from '@shared/ui/buttons';
import { Search } from '@shared/ui/form';

import { ListFilter } from 'lucide-react';

interface Props {
  onRowClick?: (row: ScheduleTableRow) => void;
}

export const ScheduleTable = ({ onRowClick }: Props) => {
  const {
    table,

    globalFilter, setGlobalFilter,

    loading, error,
  } = useScheduleTable();

  return (
    <div>
      {/* 모바일에서는 검색이 가용 폭을 채운다 (피그마 필터 바의 flex-1) */}
      <div className="mt-3 flex items-center gap-2">
        <Search className="w-full" filter={globalFilter} setFilter={setGlobalFilter} placeholder={'관리번호, 시설, 팀 검색'} />
        <Button startIcon={ListFilter} variant="outline" size="lg" />
      </div>

      <div className="py-5 flex-1 flex flex-col">
        <BasicTable
          table={table}
          error={error}
          onRowClick={onRowClick}
          mobileCard={scheduleCardConfig}
        />
      </div>

      {!loading && !error && (
        <TableFooterBar table={table} className="bg-canvas py-1" />
      )}
    </div>
  );
};
