import { useState, useMemo } from 'react';
import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useTableState } from '@shared/hooks';
import { useCompanies } from '@entities/company';
import type { Company } from '@entities/company';

import { RegisterCompanyForm } from '@features/register-company'

import { defaultColumns } from '../model/columns';
import { toCompanyRows } from '../model/mapper';
import type { CompanyTableRow } from '../model/types';

import { BasicTable } from '@shared/ui/table';
import { Search } from '@/shared/ui/form';
import { Pagination } from '@shared/ui/pagination';

interface CompanyTableProps {
  onRowClick?: (company: Company) => void;
  selectedCompany: Company | null;
}

export const CompanyTable = ({ onRowClick, selectedCompany }: CompanyTableProps) => {
  const [open, setOpen] = useState(false);
  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination } = useTableState({ pageSize: 5 });
  const { data, loading, error, refetch } = useCompanies();
  const tableData = useMemo(
    () => data?.map(toCompanyRows),
    [data]
  );

  console.log('company render', selectedCompany);

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

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-800">의뢰기관 목록</h2>
          </div>
          <RegisterCompanyForm
            open={open}
            onOpenChange={setOpen}
            onSuccess={refetch}
          />
        </div>
      </div>

      <div className="flex items-center justify-start mt-3">
        <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'의뢰기관, 주소 검색 ...'} />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <BasicTable table={table} error={error} onRowClick={handleRowClick} />
      </div>

      {!loading && !error && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="inline-flex items-center gap-0.5 text-xs text-gray-400 leading-none">
            총 <span className="font-medium text-gray-600">{table.getFilteredRowModel().rows.length}</span>건
          </span>
          <Pagination
            pageIndex={table.getState().pagination.pageIndex}
            pageCount={table.getPageCount()}
            canPreviousPage={table.getCanPreviousPage()}
            canNextPage={table.getCanNextPage()}
            onPreviousPage={() => table.previousPage()}
            onNextPage={() => table.nextPage()}
            onPageChange={(idx) => table.setPageIndex(idx)}
          />
        </div>
      )}
    </div>
  );
}
