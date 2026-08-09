import { useState, useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { useEquipments } from '@entities/equipment';
import type { EquipType, InspectionType } from '@shared/model';

import { defaultColumns } from './columns';
import { toEquipmentRows } from './mapper';
import type { EquipmentTableRow } from './types';

import { useTableState } from '@shared/model';

import { TABLE_PAGE_SIZE } from "@shared/config";

interface Props {
  type: EquipType;
  onRowClick: (equipmentId: string) => void;
  onSuccess?: () => void;
}

export const useEquipmentTable = ({ type, onRowClick, onSuccess }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  // 검사 이력은 상세 모달의 검사 행에서 열리며, 어느 검사 종류인지가 함께 필요하다.
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [inspectionType, setInspectionType] = useState<InspectionType | null>(null);

  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination } = useTableState({ pageSize: TABLE_PAGE_SIZE.COMPACT });
  const { data, loading, error, refetch: equipmentRefetch } = useEquipments(type);

  const tableData = useMemo(
    () => data?.map(toEquipmentRows),
    [data]
  );

  const handleViewDetail = () => {
    setUpdateModalOpen(true);
  };

  const handleOpenInspectionHistory = (type: InspectionType) => {
    setInspectionType(type);
    setInspectionModalOpen(true);
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

    meta: { onViewDetail: handleViewDetail },
  });

  const handleRowClick = (row: EquipmentTableRow) => {
    onRowClick(row.id);
  };

  return {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,

    inspectionModalOpen, setInspectionModalOpen,
    inspectionType, handleOpenInspectionHistory,

    globalFilter, setGlobalFilter,

    loading, error, refetch,
  };
};
