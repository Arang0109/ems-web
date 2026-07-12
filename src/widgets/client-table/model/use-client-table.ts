import { useState, useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { useClients } from '@entities/client';

import { defaultColumns } from '../model/columns';
import { toClientRows } from '../model/mapper';
import type { ClientTableRow } from '../model/types';

import { useTableState } from '@shared/model';

interface Props {
  onRowClick: (clientId: number) => void;
  onSuccess?: () => void;
}

export const useClientTable = ({ onRowClick, onSuccess }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination } = useTableState({ pageSize: 5 });
  const { data, loading, error, refetch: clientRefetch } = useClients();

  const tableData = useMemo(
    () => data?.map(toClientRows),
    [data]
  );

  const handleViewDetail = () => {
    setUpdateModalOpen(true);
  };

  const refetch = () => {
    clientRefetch();
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

    meta: { onViewClientDetail: handleViewDetail },
  });

  const handleRowClick = onRowClick
    ? (row: ClientTableRow) => {
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