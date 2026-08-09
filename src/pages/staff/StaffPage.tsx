import { PageLayout } from "@shared/ui/layout";

import { TeamTable } from "@widgets/team-table";

import { useTeamSelection } from "./model/use-team-selection";

export const StaffPage = () => {
  const { selectedTeam, handleSelectTeamRow } = useTeamSelection();

  return (
    <PageLayout
      title="팀 관리"
      description="측정 팀을 등록·수정·삭제하고 사수·부사수와 배정 장비를 관리할 수 있습니다."
    >
      <TeamTable
        selectedTeam={selectedTeam}
        onRowClick={handleSelectTeamRow}
      />
    </PageLayout>
  );
};
