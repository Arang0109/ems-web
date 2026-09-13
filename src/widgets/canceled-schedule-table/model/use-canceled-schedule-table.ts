import { useMemo } from 'react';

import { useCanceledSchedules } from '@entities/schedule';
import { useDeleteSchedule } from '@features/manage-schedule-lifecycle';

import { useDataTable } from '@shared/model';
import { TABLE_PAGE_SIZE } from '@shared/config';

import { defaultColumns } from './columns';
import { toCanceledScheduleRows } from './mapper';
import type { CanceledScheduleTableRow } from './types';

export const useCanceledScheduleTable = () => {
  const { data, isLoading, error } = useCanceledSchedules();
  const { handleDelete, isLoading: isDeleting } = useDeleteSchedule();

  const tableData = useMemo(() => data.map(toCanceledScheduleRows), [data]);

  const { table, globalFilter, setGlobalFilter } = useDataTable<CanceledScheduleTableRow>({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.DEFAULT,
    overrides: {
      meta: {
        // 이 표의 행은 모두 취소 상태다 — 확인 문구가 그에 맞게 갈린다.
        onDelete: (row) => handleDelete(Number(row.id), 'CANCELED'),
        isRowActionPending: isDeleting,
      },
    },
  });

  return { table, globalFilter, setGlobalFilter, isLoading, error };
};
