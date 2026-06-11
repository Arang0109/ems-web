import { useState, useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { useCompanies } from '@entities/company';

import { defaultColumns } from '../model/columns';
import { toCompanyRows } from '../model/mapper';
import type { CompanyTableRow } from '../model/types';

import { useTableState } from '@shared/model';

interface Props {
  onRowClick: (companyId: number) => void;
}

export const useCompanyTable = ({ onRowClick }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination } = useTableState({ pageSize: 5 });
  const { data, loading, error, refetch } = useCompanies();

  const tableData = useMemo(
    () => data?.map(toCompanyRows),
    [data]
  );

  const handleViewDetail = () => {
    setUpdateModalOpen(true);
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

    meta: { onViewCompanyDetail: handleViewDetail },
  });

  const handleRowClick = onRowClick
    ? (row: CompanyTableRow) => {
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