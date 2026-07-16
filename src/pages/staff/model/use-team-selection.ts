import { useState } from 'react';

import { useTeamDetail } from '@entities/team';

export const useTeamSelection = () => {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const { data: selectedTeam } = useTeamDetail({
    id: selectedTeamId,
  });

  const handleSelectTeamRow = (teamId: number) => {
    setSelectedTeamId(teamId);
  };

  return {
    selectedTeam,

    handleSelectTeamRow,
  };
};
