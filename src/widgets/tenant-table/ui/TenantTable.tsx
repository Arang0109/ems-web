import { useTenantTable } from '../model/use-tenant-table';

import { ProvisionTenantForm } from '@features/provision-tenant';

import { BasicTable, TableFooterBar } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { Panel } from '@shared/ui/cards';
import { useRemountKey } from '@shared/model';

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

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const provisionFormKey = useRemountKey(provisionModalOpen);

  return (
    <Panel>
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-h3 text-foreground">고객사 목록</h2>
          </div>
          <ProvisionTenantForm
            key={provisionFormKey}
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
        <TableFooterBar table={table} className="border-t border-border px-5 py-3" />
      )}
    </Panel>
  );
}
