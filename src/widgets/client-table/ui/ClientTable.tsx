import { useClientTable } from '../model/use-client-table';
import { clientCardConfig } from '../model/mobile-card';

import { RegisterClientForm } from '@features/register-client'
import { UpdateClientForm } from '@features/update-client';

import { BasicTable, TableFooterBar, TablePanel } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { useRemountKey } from '@shared/model';

interface Props {
  onRowClick: (clientId: number) => void;
  onSuccess?: () => void;
}

export const ClientTable = ({ onSuccess, onRowClick }: Props) => {
  const {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,
    detailClient,

    globalFilter, setGlobalFilter,

    loading, error, refetch
  } = useClientTable({ onRowClick, onSuccess });

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const registerFormKey = useRemountKey(registerModalOpen);
  const updateFormKey = useRemountKey(updateModalOpen);

  return (
    <>
      <TablePanel
        title="의뢰기관 목록"
        actions={
          <>
            <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'의뢰기관, 주소 검색 ...'} />
            <RegisterClientForm
              key={registerFormKey}
              open={registerModalOpen}
              onOpenChange={setRegisterModalOpen}
              onSuccess={refetch}
            />
          </>
        }
        footer={!loading && !error && <TableFooterBar table={table} />}
      >
        <BasicTable
          table={table} loading={loading} error={error} onRowClick={handleRowClick} mobileCard={clientCardConfig} />
      </TablePanel>

      <UpdateClientForm
        key={updateFormKey}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        client={detailClient}
        onSuccess={refetch}
      />
    </>
  );
}
