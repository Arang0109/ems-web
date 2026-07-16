import { useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { useSchedules } from '@entities/schedule';
import { useTableState } from '@shared/model';

import { defaultColumns } from './columns';
import { toScheduleRows } from './mapper';

export const useScheduleTable = () => {
  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination } = useTableState({ pageSize: 10 });

  const { data, loading, error } = useSchedules();

  const tableData = useMemo(
    () => data?.map(toScheduleRows),
    [data]
  );

  const table = useReactTable({
    columns: defaultColumns,
    data: tableData,

    state: { sorting, globalFilter, pagination },

    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return {
    table,

    globalFilter, setGlobalFilter,

    loading, error,
  };
};
