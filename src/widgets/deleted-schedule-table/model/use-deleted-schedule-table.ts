import { useMemo } from 'react';

import { useDeletedSchedules } from '@entities/schedule';
import { useRestoreSchedule } from '@features/manage-schedule-lifecycle';

import { useDataTable } from '@shared/model';
import { TABLE_PAGE_SIZE } from '@shared/config';

import { defaultColumns } from './columns';
import { toDeletedScheduleRows } from './mapper';
import type { DeletedScheduleTableRow } from './types';

export const useDeletedScheduleTable = () => {
  const { data, isLoading, error, refetch } = useDeletedSchedules();
  const { handleRestore, isLoading: isRestoring } = useRestoreSchedule({ onSuccess: refetch });

  const tableData = useMemo(() => data.map(toDeletedScheduleRows), [data]);

  const { table, globalFilter, setGlobalFilter } = useDataTable<DeletedScheduleTableRow>({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.DEFAULT,
    overrides: {
      meta: {
        onRestore: (row) => handleRestore(Number(row.id)),
        isRowActionPending: isRestoring,
      },
    },
  });

  return { table, globalFilter, setGlobalFilter, isLoading, error };
};
