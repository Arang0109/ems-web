import { useWorkplaceTable } from '../model/use-workplace-table';

import type { Client } from '@entities/client';
import type { Workplace, WorkplaceListItem } from '@entities/workplace';

import { RegisterWorkplaceForm } from '@features/register-workplace';
import { UpdateWorkplaceForm } from '@features/update-workplace';

import { BasicTable, TableEmptyState, TableFooterBar, TablePanel } from '@shared/ui/table';
import { useRemountKey } from '@shared/model';

import { Building2 } from 'lucide-react';

interface Props {
  workplaces: WorkplaceListItem[];
  selectedClient: Client | null;
  selectedWorkplace: Workplace | null;

  onRowClick?: (workplace: WorkplaceListItem) => void;
  onSuccess?: () => void;

  loading: boolean;
  error: string | null;
}

export const WorkplaceTable = ({
  workplaces,
  selectedClient,
  selectedWorkplace,

  onRowClick,
  onSuccess,

  loading,
  error,
}: Props) => {
  const {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    detailOpen, setDetailOpen,
  } = useWorkplaceTable({ workplaces, onRowClick });

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const registerFormKey = useRemountKey(registerModalOpen);
  const detailFormKey = useRemountKey(detailOpen);

  return (
    <>
      <TablePanel
        title="사업장 목록"
        actions={
          <>
            <RegisterWorkplaceForm
              key={registerFormKey}
              client={selectedClient}
              open={registerModalOpen}
              onOpenChange={setRegisterModalOpen}
              onSuccess={onSuccess}
            />
          </>
        }
        footer={!loading && !error && <TableFooterBar table={table} className="bg-canvas py-1" />}
      >
        <div className="bg-canvas">
          {!selectedClient ? (
            <TableEmptyState
              icon={<Building2 size={22} className="text-muted-foreground" />}
              label='사업장 정보 없음'
              subLabel={<span>왼쪽에서 의뢰기관을 선택하면<br />해당 사업장 목록이 표시됩니다.</span>}
            />
          ) : (
            <BasicTable table={table} error={error} onRowClick={handleRowClick} />
          )}
        </div>
      </TablePanel>

      <UpdateWorkplaceForm
        key={detailFormKey}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        client={selectedClient}
        workplace={selectedWorkplace}
        onSuccess={onSuccess}
      />
    </>
  );
};
