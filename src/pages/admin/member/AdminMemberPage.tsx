import { PageLayout } from "@shared/ui/layout";

import { MemberTable } from "@widgets/member-table";

import { useMemberSelection } from "./model/use-member-selection";

export const AdminMemberPage = () => {
  const { selectedMember, handleSelectMemberRow } = useMemberSelection();

  return (
    <PageLayout title="회원 관리" description="소속 회원 계정을 등록·수정·삭제할 수 있습니다.">
      <MemberTable
        selectedMember={selectedMember}
        onRowClick={handleSelectMemberRow}
      />
    </PageLayout>
  );
}
