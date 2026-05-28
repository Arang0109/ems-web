import React, { useEffect, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
  type ExpandedState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight, Search } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { companyApi } from '@entities/company';
import type { Company, CompanyStatus } from '@entities/company';

// ── 상태 배지 ──────────────────────────────────────────────
const STATUS_MAP: Record<CompanyStatus, { label: string; className: string }> = {
  active:   { label: '활성', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  inactive: { label: '비활성', className: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200' },
};

const StatusBadge = ({ status }: { status: CompanyStatus }) => {
  const { label, className } = STATUS_MAP[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
};

// ── 정렬 아이콘 ────────────────────────────────────────────
const SortIcon = ({ sorted }: { sorted: false | 'asc' | 'desc' }) => {
  if (sorted === 'asc')  return <ChevronUp  size={14} className="ml-1 shrink-0 text-blue-500" />;
  if (sorted === 'desc') return <ChevronDown size={14} className="ml-1 shrink-0 text-blue-500" />;
  return <ChevronsUpDown size={14} className="ml-1 shrink-0 text-gray-300" />;
};

// ── 사업장 중첩 테이블 ─────────────────────────────────────
const WorkplaceSubTable = ({ rows }: { rows: Company['workplaces'] }) => (
  <div>
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50/70 hover:bg-gray-50/70">
          <TableHead className="text-left py-2 px-3 font-semibold">사업장명</TableHead>
          <TableHead className="text-left py-2 px-3 font-semibold">주소</TableHead>
          <TableHead className="text-left py-2 px-3 font-semibold">대표자</TableHead>
          <TableHead className="text-left py-2 px-3 font-semibold">상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i} className="border-t border-gray-100">
            <TableCell className="py-2 px-3 font-medium text-gray-700">{row.name}</TableCell>
            <TableCell className="py-2 px-3 text-gray-500">{row.address}</TableCell>
            <TableCell className="py-2 px-3 text-gray-500">{row.representative}</TableCell>
            <TableCell className="py-2 px-3"><StatusBadge status={row.status} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

// ── 컬럼 정의 ─────────────────────────────────────────────
const columnHelper = createColumnHelper<Company>();

const defaultColumns = [
  columnHelper.display({
    id: 'expand',
    size: 40,
    header: "",
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <button
          onClick={row.getToggleExpandedHandler()}
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronDown size={16} />
        </button>
      ) : null;
    }
  }),
  columnHelper.accessor('name', {
    header: '거래처명',
    cell: (info) => (
      <span className="font-medium text-gray-800">{info.getValue()}</span>
    ),
  }),
  columnHelper.display({
    id: 'workplaceCount',
    header: '사업장 수',
    cell: ({ row }) => {
      const count = row.original.workplaces.length;
      return count > 0
        ? <span className="text-xs text-gray-500">{count}개</span>
        : <span className="text-xs text-gray-300">-</span>;
    },
  }),
  columnHelper.display({
    id: 'status',
    header: '상태',
    cell: (info) => <StatusBadge status={info.row.original.status} />,
  }),
];

// ── 메인 컴포넌트 ─────────────────────────────────────────
export const CompanyTable = () => {
  "use no memo";

  const [data, setData]         = useState<Company[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [sorting, setSorting]   = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter]   = useState('');
  const [statusFilter, setStatusFilter]   = useState<'all' | 'active' | 'inactive'>('all');
  const [expanded, setExpanded] = useState<ExpandedState>({});

  useEffect(() => {
    companyApi.getCompanies()
      .then((res) => {
        if (res.status) setData(res.data);
        else setError(res.message ?? '데이터를 불러오지 못했습니다.');
      })
      .catch(() => setError('서버 연결에 실패했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setColumnFilters((prev) => {
      const others = prev.filter((f) => f.id !== 'status');
      return statusFilter === 'all' ? others : [...others, { id: 'status', value: statusFilter }];
    });
  }, [statusFilter]);

  const table = useReactTable({
    columns: defaultColumns,
    data,

    state: { sorting, columnFilters, globalFilter, expanded },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const rows = table.getRowModel().rows;
  const colCount = defaultColumns.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* 툴바 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100">
        {/* 검색 */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="거래처명 검색…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
          />
        </div>

        {/* 상태 필터 탭 */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 text-sm font-medium">
          {(['all', 'active', 'inactive'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className={`rounded-md px-3 py-1 transition-colors ${
                statusFilter === v
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v === 'all' ? '전체' : v === 'active' ? '활성' : '비활성'}
            </button>
          ))}
        </div>
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
                {/* 거래처 행 */}
                <TableRow
                  className={`transition-colors ${
                    row.original.workplaces.length > 0
                      ? 'cursor-pointer hover:bg-gray-50'
                      : ''
                  } ${row.getIsExpanded() ? 'bg-gray-50/60' : ''}`}
                  onClick={() => { if (row.original.workplaces.length > 0) row.toggleExpanded(); }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>

                {/* 사업장 확장 행 */}
                {row.getIsExpanded() && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={colCount} className="pb-3 pt-0 pl-12 pr-4">
                      <WorkplaceSubTable rows={row.original.workplaces} />
                    </TableCell>
                  </TableRow>
                )}
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
