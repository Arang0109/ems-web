import { useMemberTable } from '../model/use-member-table';

import { RegisterMemberForm } from '@features/register-member';
import { UpdateMemberForm } from '@features/update-member';

import { BasicTable, TableFooterBar } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { Panel } from '@shared/ui/cards';
import type { Member } from '@entities/member';

interface Props {
  selectedMember: Member | null;
  onRowClick: (memberId: number) => void;
  onSuccess?: () => void;
}

export const MemberTable = ({ selectedMember, onSuccess, onRowClick }: Props) => {
  const {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,

    globalFilter, setGlobalFilter,

    loading, error, refetch
  } = useMemberTable({ onRowClick, onSuccess });

  return (
    <Panel>
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-h3 text-foreground">회원 목록</h2>
          </div>
          <RegisterMemberForm
            open={registerModalOpen}
            onOpenChange={setRegisterModalOpen}
            onSuccess={refetch}
          />
        </div>
      </div>

      <div className="flex items-center justify-start mt-3">
        <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'아이디, 이름, 부서 검색 ...'} />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <BasicTable table={table} error={error} onRowClick={handleRowClick} />
      </div>

      {!loading && !error && (
        <TableFooterBar table={table} className="border-t border-border px-5 py-3" />
      )}

      <UpdateMemberForm
        key={selectedMember?.id}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        member={selectedMember}
        onSuccess={refetch}
      />
    </Panel>
  );
}
