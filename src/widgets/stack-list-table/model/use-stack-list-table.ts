import { useEffect, useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { useStacks } from '@entities/stack';

import { defaultColumns } from './columns';
import { toStackRows } from './mapper';

import { useTableState } from '@shared/model';

export const useStackListTable = () => {
  const { data, loading, error, fetchStacks } = useStacks();

  useEffect(() => {
    fetchStacks(null);
  }, []);

  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination,
  } = useTableState({ pageSize: 10 });

  const tableData = useMemo(() => data.map(toStackRows), [data]);

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
    loading, error,
    globalFilter, setGlobalFilter,
  };
};
