import { flexRender, type Table } from '@tanstack/react-table';

import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SortIcon } from '@/shared/assets';

interface BasicTableProps<TData> {
  table: Table<TData>;
  error?: string | null;
  onRowClick?: (row: TData) => void;
}

export const BasicTable = <TData,>({ table, error, onRowClick }: BasicTableProps<TData>) => {
  const rows = table.getRowModel().rows;
  const colCount = table.getAllColumns().length;

  return (
    <ShadcnTable>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id} className="bg-gray-50/70 hover:bg-gray-50/70">
            {hg.headers.map((header) => {
              const canSort = header.column.getCanSort();
              const sorted = header.column.getIsSorted();
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
            <TableRow
              key={row.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className='text-xs'>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </ShadcnTable>
  );
};
