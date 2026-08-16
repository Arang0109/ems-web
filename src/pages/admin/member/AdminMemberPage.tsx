import { PageLayout } from "@shared/ui/layout";

import { MemberTable } from "@widgets/member-table";

export const AdminMemberPage = () => {
  return (
    <PageLayout title="회원 관리" description="소속 회원 계정을 등록·수정·삭제할 수 있습니다.">
      <MemberTable />
    </PageLayout>
  );
}
