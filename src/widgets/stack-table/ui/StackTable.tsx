import { useStackTable } from '../model/use-stack-table';

import type { Workplace } from '@entities/workplace';
import type { StackListItem } from '@entities/stack';

import { RegisterStackForm } from '@features/register-stack';

import { Building2 } from 'lucide-react';

import { BasicTable, TableEmptyState } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { Pagination } from '@shared/ui/pagination';

interface Props {
  data: StackListItem[];
  loading: boolean;
  error: string | null;
  selectedWorkplace: Workplace | null;
  onSuccess?: () => void;
}

export const StackTable = ({
  data, loading, error, selectedWorkplace, onSuccess
}: Props) => {
  const {
    table,
    registerModalOpen, setRegisterModalOpen,
    globalFilter, setGlobalFilter,
  } = useStackTable({ data, selectedWorkplace });

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-800">측정시설 목록</h2>
            {selectedWorkplace ? (
              <p className="mt-0.5 text-xs text-blue-600 font-medium truncate">
                {selectedWorkplace.name}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-gray-400">
                사업장을 선택해주세요
              </p>
            )}
          </div>
          <RegisterStackForm
            key={selectedWorkplace?.id}
            workplace={selectedWorkplace}
            open={registerModalOpen}
            onOpenChange={setRegisterModalOpen}
            onSuccess={onSuccess}
          />
        </div>
      </div>

      <div className="flex items-center justify-start mt-3">
        <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'측정시설, 측정분야 검색 ...'} />
      </div>

      {/* 컨텐츠 */}
      <div className="p-5 flex-1 flex flex-col">
        {!selectedWorkplace ? (
          <TableEmptyState
            icon={<Building2 size={22} className="text-gray-400" />}
            label='측정시설 정보 없음'
            subLabel={<span>위쪽에서 사업장을 선택하면<br />해당 측정시설 목록이 표시됩니다.</span>}
          />
        ) : (
          <BasicTable table={table} error={error} />
        )}
      </div>

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
}
