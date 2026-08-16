import { usePollutantTable } from '../model/use-pollutant-table';
import { pollutantCardConfig } from '../model/mobile-card';

import { RegisterPollutantForm } from '@features/register-pollutant';
import { UpdatePollutantForm } from '@features/update-pollutant';

import { BasicTable, TableFooterBar, TablePanel } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { useRemountKey } from '@shared/model';

interface Props {
  onSuccess?: () => void;
}

export const PollutantTable = ({ onSuccess }: Props) => {
  const {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,
    detailPollutant,

    globalFilter, setGlobalFilter,

    loading, error, refetch,
  } = usePollutantTable({ onSuccess });

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const registerFormKey = useRemountKey(registerModalOpen);
  const updateFormKey = useRemountKey(updateModalOpen);

  return (
    <>
      <TablePanel
        title="측정물질 목록"
        actions={
          <>
            <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'측정물질명, 측정장비 검색 ...'} />
            <RegisterPollutantForm
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
          table={table}
          loading={loading}
          error={error}
          onRowClick={handleRowClick}
          mobileCard={pollutantCardConfig}
        />
      </TablePanel>

      <UpdatePollutantForm
        key={`${updateFormKey}-${detailPollutant?.id}`}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        pollutant={detailPollutant}
        onSuccess={refetch}
      />
    </>
  );
};
