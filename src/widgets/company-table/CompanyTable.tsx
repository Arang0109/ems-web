import { useEffect, useState } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

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

// ── 컬럼 정의 ─────────────────────────────────────────────
const columns: ColumnDef<Company>[] = [
  {
    id: 'index',
    header: 'No.',
    cell: ({ row }) => (
      <span className="text-gray-400 text-xs">{row.index + 1}</span>
    ),
    enableSorting: false,
    size: 48,
  },
  {
    accessorKey: 'name',
    header: '거래처명',
    cell: ({ getValue }) => (
      <span className="font-medium text-gray-800">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'businessNumber',
    header: '사업자번호',
    cell: ({ getValue }) => (
      <span className="font-mono text-gray-600">{getValue<string>()}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'representative',
    header: '대표자',
    cell: ({ getValue }) => <span className="text-gray-700">{getValue<string>()}</span>,
  },
  {
    accessorKey: 'phone',
    header: '연락처',
    cell: ({ getValue }) => <span className="text-gray-600">{getValue<string>()}</span>,
    enableSorting: false,
  },
  {
    accessorKey: 'address',
    header: '주소',
    cell: ({ getValue }) => (
      <span className="text-gray-600 truncate max-w-xs block">{getValue<string>()}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'registeredAt',
    header: '등록일',
    cell: ({ getValue }) => <span className="text-gray-500 text-xs">{getValue<string>()}</span>,
  },
  {
    accessorKey: 'status',
    header: '상태',
    cell: ({ getValue }) => <StatusBadge status={getValue<CompanyStatus>()} />,
    enableSorting: false,
    filterFn: (row, columnId, filterValue) =>
      filterValue === 'all' ? true : row.getValue(columnId) === filterValue,
  },
];

// ── 스켈레톤 ──────────────────────────────────────────────
const TableSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: columns.length }).map((_, j) => (
          <TableCell key={j}>
            <Skeleton className="h-4 w-full rounded" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

// ── 메인 컴포넌트 ─────────────────────────────────────────
// useReactTable()은 매 렌더마다 새 함수를 반환하므로 React Compiler 자동 메모이제이션과
// 호환되지 않습니다. "use no memo" 디렉티브로 명시적으로 opt-out 합니다.
export const CompanyTable = () => {
  "use no memo";

  const [data, setData]         = useState<Company[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [sorting, setSorting]   = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter]   = useState('');
  const [statusFilter, setStatusFilter]   = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    companyApi.getCompanies()
      .then((res) => {
        if (res.status) setData(res.data);
        else setError(res.message ?? '데이터를 불러오지 못했습니다.');
      })
      .catch(() => setError('서버 연결에 실패했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  // 상태 필터를 columnFilters에 동기화
  useEffect(() => {
    setColumnFilters((prev) => {
      const others = prev.filter((f) => f.id !== 'status');
      return statusFilter === 'all' ? others : [...others, { id: 'status', value: statusFilter }];
    });
  }, [statusFilter]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* 툴바 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100">
        {/* 검색 */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="거래처명, 대표자, 주소 검색…"
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
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
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
          {loading ? (
            <TableSkeleton />
          ) : error ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-16 text-center text-sm text-red-500">
                {error}
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-16 text-center text-sm text-gray-400">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} className="cursor-pointer">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
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
