import { useClientTable } from '../model/use-client-table';
import { clientCardConfig } from '../model/mobile-card';

import { RegisterClientForm } from '@features/register-client'
import { UpdateClientForm } from '@features/update-client';

import { BasicTable, TableFooterBar, TablePanel } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import type { Client } from '@entities/client';

interface Props {
  selectedClient: Client | null;
  onRowClick: (clientId: number) => void;
  onSuccess?: () => void;
}

export const ClientTable = ({ selectedClient, onSuccess, onRowClick }: Props) => {
  const {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,

    globalFilter, setGlobalFilter,

    loading, error, refetch
  } = useClientTable({ onRowClick, onSuccess });

  return (
    <>
      <TablePanel
        title="의뢰기관 목록"
        actions={
          <>
            <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'의뢰기관, 주소 검색 ...'} />
            <RegisterClientForm
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
        key={selectedClient?.id}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        client={selectedClient}
        onSuccess={refetch}
      />
    </>
  );
}
