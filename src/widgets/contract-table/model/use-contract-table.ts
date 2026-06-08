import { useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { useTableState } from '@shared/model';
import { useContracts } from '@entities/contract';

import { defaultColumns } from '../model/columns';
import { toContractRows } from '../model/mapper';

export const useContractTable = () => {
  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination,
  } = useTableState({ pageSize: 20 });

  const { data, loading, error } = useContracts();
  const tableData = useMemo(() => data.map(toContractRows), [data]);

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

  return { table, loading, error, globalFilter, setGlobalFilter };
};
