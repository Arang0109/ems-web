import { useState, useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { useEquipments } from '@entities/equipment';
import type { EquipType } from '@shared/model';

import { defaultColumns } from './columns';
import { toEquipmentRows } from './mapper';
import type { EquipmentTableRow } from './types';

import { useTableState } from '@shared/model';

interface Props {
  type: EquipType;
  onRowClick: (equipmentId: string) => void;
  onSuccess?: () => void;
}

export const useEquipmentTable = ({ type, onRowClick, onSuccess }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination } = useTableState({ pageSize: 5 });
  const { data, loading, error, refetch: equipmentRefetch } = useEquipments(type);

  const tableData = useMemo(
    () => data?.map(toEquipmentRows),
    [data]
  );

  const handleViewDetail = () => {
    setUpdateModalOpen(true);
  };

  const refetch = () => {
    equipmentRefetch();
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

    meta: { onViewEquipmentDetail: handleViewDetail },
  });

  const handleRowClick = (row: EquipmentTableRow) => {
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
