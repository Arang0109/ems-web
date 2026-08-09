import { useState, useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { useTeams } from '@entities/team';

import { defaultColumns } from './columns';
import { toTeamRows } from './mapper';
import type { TeamTableRow } from './types';

import { useTableState } from '@shared/model';

import { TABLE_PAGE_SIZE } from "@shared/config";

interface Props {
  onRowClick: (teamId: number) => void;
  onSuccess?: () => void;
}

export const useTeamTable = ({ onRowClick, onSuccess }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination } = useTableState({ pageSize: TABLE_PAGE_SIZE.COMPACT });
  const { data, loading, error, refetch: teamRefetch } = useTeams();

  const tableData = useMemo(
    () => data?.map(toTeamRows),
    [data]
  );

  const handleViewDetail = () => {
    setUpdateModalOpen(true);
  };

  const refetch = () => {
    teamRefetch();
    onSuccess?.();
  };

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

    meta: { onViewTeamDetail: handleViewDetail },
  });

  const handleRowClick = (row: TeamTableRow) => {
    onRowClick(row.id);
  };

  return {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,

    globalFilter, setGlobalFilter,

    loading, error, refetch,
  };
};
