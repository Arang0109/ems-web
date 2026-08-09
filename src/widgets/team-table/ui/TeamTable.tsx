import { useTeamTable } from '../model/use-team-table';

import { RegisterTeamForm } from '@features/register-team';
import { UpdateTeamForm } from '@features/update-team';

import { BasicTable, TableFooterBar } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { Panel } from '@shared/ui/cards';
import type { Team } from '@entities/team';

interface Props {
  selectedTeam: Team | null;
  onRowClick: (teamId: number) => void;
  onSuccess?: () => void;
}

export const TeamTable = ({ selectedTeam, onSuccess, onRowClick }: Props) => {
  const {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,

    globalFilter, setGlobalFilter,

    loading, error, refetch,
  } = useTeamTable({ onRowClick, onSuccess });

  return (
    <Panel>
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-h3 text-foreground">팀 목록</h2>
          </div>
          <RegisterTeamForm
            open={registerModalOpen}
            onOpenChange={setRegisterModalOpen}
            onSuccess={refetch}
          />
        </div>
      </div>

      <div className="flex items-center justify-start mt-3">
        <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'팀 이름, 사수, 부사수 검색 ...'} />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <BasicTable table={table} error={error} onRowClick={handleRowClick} />
      </div>

      {!loading && !error && (
        <TableFooterBar table={table} className="border-t border-border px-5 py-3" />
      )}

      <UpdateTeamForm
        key={selectedTeam?.id}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        team={selectedTeam}
        onSuccess={refetch}
      />
    </Panel>
  );
};
