import { useState, useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { defaultColumns } from './columns';

import { useTableState } from '@shared/model';
import type { ScheduleListItem } from '@entities/schedule';
import { toTeamScheduleRows } from '../model/mapper';

import { TABLE_PAGE_SIZE } from "@shared/config";

interface Props {
  schedules: ScheduleListItem[];
}

export const useTeamScheduleTable = ({ schedules }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination,
  } = useTableState({ pageSize: TABLE_PAGE_SIZE.DEFAULT });

  const tableData = useMemo(() => schedules.map(toTeamScheduleRows), [schedules]);

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
