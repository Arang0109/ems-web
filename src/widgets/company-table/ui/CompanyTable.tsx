import { useEffect, useState } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
} from '@tanstack/react-table';
import { companyApi } from '@entities/company';
import type { Company } from '@entities/company';

import { RegisterCompanyForm } from '@features/register-company'

import { defaultColumns } from '../model/columns';

import { BasicTable } from '@shared/ui/table';
import { Search } from '@shared/ui/form-fields';
import { FormDialog } from '@shared/ui/dialogs';
import { Pagination } from '@shared/ui/pagination';

interface CompanyTableProps {
  onRowClick?: (company: Company) => void;
}

export const CompanyTable = ({ onRowClick }: CompanyTableProps) => {
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  useEffect(() => {
    companyApi.getCompanies()
      .then((res) => {
        if (res.status) setData(res.data);
        else setError(res.message ?? '데이터를 불러오지 못했습니다.');
      })
      .catch(() => setError('서버 연결에 실패했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const table = useReactTable({
    columns: defaultColumns,
    data,

    state: { sorting, globalFilter, pagination },

    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-800">의뢰기관 목록</h2>
          </div>
          <FormDialog
            triggerLabel='측정대행 의뢰기관 등록'
            title='측정대행 의뢰기관 등록'
            description='측정대행 의뢰기관을 등록합니다.'
            children={<RegisterCompanyForm />}
          />
        </div>
      </div>

      <div className="flex items-center justify-start mt-3">
        <Search filter={globalFilter} setFilter={setGlobalFilter} placeholer={'의뢰기관, 주소 검색 ...'} />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* 테이블 */}
        <BasicTable table={table} error={error} onRowClick={onRowClick} />
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