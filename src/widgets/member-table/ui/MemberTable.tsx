import { useMemberTable } from '../model/use-member-table';
import { memberCardConfig } from '../model/mobile-card';

import { RegisterMemberForm } from '@features/register-member';
import { UpdateMemberForm } from '@features/update-member';

import { BasicTable, TableFooterBar, TablePanel } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { useRemountKey } from '@shared/model';

interface Props {
  onSuccess?: () => void;
}

export const MemberTable = ({ onSuccess }: Props) => {
  const {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,
    detailMember,

    globalFilter, setGlobalFilter,

    isLoading, error, refetch
  } = useMemberTable({ onSuccess });

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const registerFormKey = useRemountKey(registerModalOpen);
  const updateFormKey = useRemountKey(updateModalOpen);

  return (
    <>
      <TablePanel
        title="회원 목록"
        actions={
          <>
            <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'아이디, 이름, 부서 검색 ...'} />
            <RegisterMemberForm
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
          mobileCard={memberCardConfig}  
        />
      </TablePanel>

      <UpdateMemberForm
        key={updateFormKey}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        member={detailMember}
        onSuccess={refetch}
      />
    </>
  );
}
