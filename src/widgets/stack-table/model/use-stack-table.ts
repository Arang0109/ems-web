import { useState, useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import type { StackListItem } from '@entities/stack';

import { defaultColumns } from '../model/columns';
import { toStackRows } from '../model/mapper';

import { useTableState } from '@shared/model';

interface Props {
  stacks: StackListItem[];
}

export const useStackTable = ({ stacks }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination,
  } = useTableState({ pageSize: 10 });

  const tableData = useMemo(() => stacks.map(toStackRows), [stacks]);

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

    registerModalOpen, setRegisterModalOpen,

    globalFilter, setGlobalFilter,
  };
};
