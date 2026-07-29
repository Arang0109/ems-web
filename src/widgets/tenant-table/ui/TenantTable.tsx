import { useTenantTable } from '../model/use-tenant-table';

import { ProvisionTenantForm } from '@features/provision-tenant';

import { BasicTable } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { Pagination } from '@shared/ui/pagination';
import { Panel } from '@shared/ui/cards';

interface Props {
  onSuccess?: () => void;
}

export const TenantTable = ({ onSuccess }: Props) => {
  const {
    table,

    provisionModalOpen, setProvisionModalOpen,

    globalFilter, setGlobalFilter,

    loading, error, refetch
  } = useTenantTable({ onSuccess });

  return (
    <Panel>
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">고객사 목록</h2>
          </div>
          <ProvisionTenantForm
            open={provisionModalOpen}
            onOpenChange={setProvisionModalOpen}
            onSuccess={refetch}
          />
        </div>
      </div>

      <div className="flex items-center justify-start mt-3">
        <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'고객사명, 사업자번호 검색 ...'} />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <BasicTable table={table} error={error} />
      </div>

      {!loading && !error && (
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground leading-none">
            총 <span className="font-medium text-muted-foreground">{table.getFilteredRowModel().rows.length}</span>건
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
    </Panel>
  );
}
