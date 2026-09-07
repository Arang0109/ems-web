import { Layers } from 'lucide-react';

import { usePollutantCatalogTable } from '../model/use-pollutant-catalog-table';
import { pollutantCatalogCardConfig } from '../model/mobile-card';

import { RegisterPollutantCatalogForm } from '@features/register-pollutant-catalog';
import { UpdatePollutantCatalogForm } from '@features/update-pollutant-catalog';

import { BasicTable, TableFooterBar, TablePanel } from '@shared/ui/table';
import { FilterSelect, Search } from '@shared/ui/form';
import { useRemountKey } from '@shared/model';

export const PollutantCatalogTable = () => {
  const {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,
    detailCatalog,

    globalFilter, setGlobalFilter,
    field, setField, fieldOptions,

    isLoading, error,
  } = usePollutantCatalogTable();

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const registerFormKey = useRemountKey(registerModalOpen);
  const updateFormKey = useRemountKey(updateModalOpen);

  return (
    <>
      <TablePanel
        title="측정물질 카탈로그"
        actions={
          <>
            <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'코드, 물질명 검색 ...'} />
            <FilterSelect
              icon={Layers}
              options={fieldOptions}
              value={field}
              onValueChange={(value) => value && setField(value)}
              placeholder="전체 분야"
              ariaLabel="측정분야 필터"
            />
            <RegisterPollutantCatalogForm
              key={registerFormKey}
              open={registerModalOpen}
              onOpenChange={setRegisterModalOpen}
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
          mobileCard={pollutantCatalogCardConfig}
        />
      </TablePanel>

      <UpdatePollutantCatalogForm
        key={`${updateFormKey}-${detailCatalog?.id}`}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        catalog={detailCatalog}
      />
    </>
  );
};
