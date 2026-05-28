import React, { useEffect, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
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

import { companyApi } from '@entities/company';
import type { Company } from '@entities/company';

import { defaultColumns } from '../model/columns';

import { SearchInput } from './SearchInput';
import { TableToolbar } from './TableToolbar';
import type { ActiveStatus } from '@/shared/model';


// ── 메인 컴포넌트 ─────────────────────────────────────────
export const CompanyTable = () => {
  const [data, setData]         = useState<Company[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [sorting, setSorting]   = useState<SortingState>([]);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ActiveStatus>('active');

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

    state: { sorting },

    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;
  const colCount = defaultColumns.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className='flex justify-between m-5'>
        <SearchInput filter={filter} setFilter={setFilter} />
        <TableToolbar statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      </div>
      
      {/* 테이블 */}
      <Table>
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

      {/* 푸터: 건수 */}
      {!loading && !error && (
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          총 <span className="font-medium text-gray-600">{rows.length}</span>건
          {data.length !== rows.length && ` (전체 ${data.length}건)`}
        </div>
      )}
    </div>
  );
};
