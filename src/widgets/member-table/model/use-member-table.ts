import { useState, useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { useMembers } from '@entities/member';

import { defaultColumns } from '../model/columns';
import { toMemberRows } from '../model/mapper';
import type { MemberTableRow } from '../model/types';

import { useTableState } from '@shared/model';

interface Props {
  onRowClick: (memberId: number) => void;
  onSuccess?: () => void;
}

export const useMemberTable = ({ onRowClick, onSuccess }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination } = useTableState({ pageSize: 5 });
  const { data, loading, error, refetch: memberRefetch } = useMembers();

  const tableData = useMemo(
    () => data?.map(toMemberRows),
    [data]
  );

  const handleViewDetail = () => {
    setUpdateModalOpen(true);
  };

  const refetch = () => {
    memberRefetch();
    onSuccess?.();
  }

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

    meta: { onViewMemberDetail: handleViewDetail },
  });

  const handleRowClick = onRowClick
    ? (row: MemberTableRow) => {
        onRowClick(row.id);
      }
    : undefined;

  return {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,

    globalFilter, setGlobalFilter,

    loading, error, refetch,
  }
}
