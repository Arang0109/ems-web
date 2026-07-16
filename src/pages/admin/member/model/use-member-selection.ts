import { useState } from 'react';

import { useMemberDetail } from '@entities/member';

export const useMemberSelection = () => {
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const { data: selectedMember } = useMemberDetail({
    id: selectedMemberId,
  });

  const handleSelectMemberRow = (memberId: number) => {
    setSelectedMemberId(memberId);
  };

  return {
    selectedMember,

    handleSelectMemberRow,
  };
};
