import React, { useEffect, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { SortIcon } from '@shared/icon';

import { workplaceApi } from '@entities/workplace';
import type { workplaceTableD } from '@entities/workplace';

import { CONTRACT_STATUS } from '@shared/model'
import type { ContractStatus } from '@shared/model'

import { defaultColumns } from '../model/columns';

import { Search } from '@shared/ui/form-fields';
import { ContractFilterToolbar } from './ContractFilterToolbar';
import { Pagination } from '@/shared/ui/pagination';


export const WorkplaceTable = () => {
  const [data, setData]         = useState<workplaceTableD[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [sorting, setSorting]   = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const initialStatuses = new Set(CONTRACT_STATUS.filter(s => s !== 'expired'));
  const [selectedStatuses, setSelectedStatuses] = useState<Set<ContractStatus>>(initialStatuses);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    [{ id: 'status', value: initialStatuses }]
  );
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    workplaceApi.getWorkplaceTableDatas()
      .then((res) => {
        if (res.status) setData(res.data);
        else setError(res.message ?? '데이터를 불러오지 못했습니다.');
      })
      .catch(() => setError('서버 연결에 실패했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusFilterChange = (statuses: Set<ContractStatus>) => {
    setSelectedStatuses(statuses);
    const isAll = CONTRACT_STATUS.every(s => statuses.has(s));
    setColumnFilters(isAll ? [] : [{ id: 'status', value: statuses }]);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const table = useReactTable({
    columns: defaultColumns,
    data,

    state: { sorting, globalFilter, columnFilters, pagination },

    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;
  const colCount = defaultColumns.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between m-5">
        <Search
          filter={globalFilter} setFilter={setGlobalFilter}
          placeholer={'거래처, 사업장, 주소 검색 ...'}
        />
        <ContractFilterToolbar
          selectedStatuses={selectedStatuses}
          onChange={handleStatusFilterChange}
        />
      </div>

      {/* 테이블 */}
      <Table className='mx-5'>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="bg-gray-50/70 hover:bg-gray-50/70">
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted  = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.getSize() !== 150 ? header.column.getSize() : undefined }}
                    className={canSort ? 'cursor-pointer select-none' : ''}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <span className="inline-flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && <SortIcon sorted={sorted} />}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {error ? (
            <TableRow>
              <TableCell colSpan={colCount} className="py-16 text-center text-sm text-red-500">
                {error}
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colCount} className="py-16 text-center text-sm text-gray-400">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <React.Fragment key={row.id}>
                <TableRow className="cursor-pointer hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>

      {/* 푸터: 건수 + 페이지네이션 */}
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
};
