import { useContractTable } from '../model/use-contract-table';

import { BasicTable } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { Pagination } from '@shared/ui/pagination';

export const ContractTable = () => {
  const { table, loading, error, globalFilter, setGlobalFilter } = useContractTable();

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-800">계약서 목록</h2>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start mt-3">
        <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'계약서 검색 ...'} />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <BasicTable table={table} />
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
