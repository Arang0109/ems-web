import { useState, useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { useTenants } from '@entities/tenant';

import { defaultColumns } from '../model/columns';
import { toTenantRows } from '../model/mapper';

import { useTableState } from '@shared/model';

import { TABLE_PAGE_SIZE } from "@shared/config";

export const useTenantTable = () => {
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);

  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination } = useTableState({ pageSize: TABLE_PAGE_SIZE.COMPACT });
  const { data, isLoading: loading, error } = useTenants();

  const tableData = useMemo(
    () => data?.map(toTenantRows),
    [data]
  );


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

    provisionModalOpen, setProvisionModalOpen,

    globalFilter, setGlobalFilter,

    isLoading: loading, error,
  }
}
