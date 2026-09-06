import { Layers } from 'lucide-react';

import { usePollutantTable } from '../model/use-pollutant-table';
import { pollutantCardConfig } from '../model/mobile-card';

import { RegisterPollutantForm } from '@features/register-pollutant';
import { UpdatePollutantForm } from '@features/update-pollutant';

import { BasicTable, TableFooterBar, TablePanel } from '@shared/ui/table';
import { FilterSelect, Search } from '@shared/ui/form';
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
    detailId, detailPollutant,

    globalFilter, setGlobalFilter,
    field, setField, fieldOptions,

    isLoading, error, refetch,
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
            <FilterSelect
              icon={Layers}
              options={fieldOptions}
              value={field}
              onValueChange={(value) => value && setField(value)}
              placeholder="전체 분야"
              ariaLabel="측정분야 필터"
            />
            <RegisterPollutantForm
              key={registerFormKey}
              open={registerModalOpen}
              onOpenChange={setRegisterModalOpen}
              onSuccess={refetch}
            />
          </>
        }
        footer={!isLoading && !error && <TableFooterBar table={table} />}
      >
        <BasicTable
          table={table}
          loading={isLoading}
          error={error}
          onRowClick={handleRowClick}
          mobileCard={pollutantCardConfig}
        />
      </TablePanel>

      <UpdatePollutantForm
        key={`${updateFormKey}-${detailId}`}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        pollutant={detailPollutant}
        onSuccess={refetch}
      />
    </>
  );
};
