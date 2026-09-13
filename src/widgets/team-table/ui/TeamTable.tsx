import { useTeamTable } from '../model/use-team-table';
import { teamCardConfig } from '../model/mobile-card';

import { RegisterTeamForm } from '@features/register-team';
import { UpdateTeamForm } from '@features/update-team';

import { BasicTable, TableFooterBar, TablePanel } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { useRemountKey } from '@shared/model';

export const TeamTable = () => {
  const {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,
    detailTeam,

    globalFilter, setGlobalFilter,

    isLoading, error,
  } = useTeamTable();

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const registerFormKey = useRemountKey(registerModalOpen);
  const updateFormKey = useRemountKey(updateModalOpen);

  return (
    <>
      <TablePanel
        title="팀 목록"
        actions={
          <>
            <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'팀 이름, 사수, 부사수 검색 ...'} />
            <RegisterTeamForm
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
          mobileCard={teamCardConfig}
        />
      </TablePanel>

      <UpdateTeamForm
        key={updateFormKey}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        team={detailTeam}
      />
    </>
  );
};
