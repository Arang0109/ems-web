import { useState, useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { useCompanies } from '@entities/company';
import type { Company } from '@entities/company';

import { defaultColumns } from '../model/columns';
import { toCompany, toCompanyRows } from '../model/mapper';
import type { CompanyTableRow } from '../model/types';

import { useTableState } from '@shared/model';

interface Props {
  onRowClick?: (company: Company) => void;
}

export const useCompanyTable = ({ onRowClick }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);

  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination } = useTableState({ pageSize: 5 });
  const { data, loading, error, refetch } = useCompanies();

  const tableData = useMemo(
    () => data?.map(toCompanyRows),
    [data]
  );

  const handleViewDetail = (row: CompanyTableRow) => {
    setDetailCompany(toCompany(row));
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
        onRowClick({
          id: row.id,
          name: row.name,
          representative: row.representative,
          address: row.address,
          bizNumber: row.bizNumber,
          manager: row.manager,
          email: row.email,
          tel: row.tel,
        });
      }
    : undefined;

  return {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,
    detailCompany,

    globalFilter, setGlobalFilter,

    loading, error, refetch
  }
}