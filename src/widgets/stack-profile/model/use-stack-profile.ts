import { useEffect } from 'react';

import { useStackDetail } from '@entities/stack';

import { toStackProfile, toPreventionProfiles, toFacilityProfiles } from './mapper';

export const useStackProfile = (stackId: string | undefined) => {
  const { data, loading, error, fetchStack } = useStackDetail();
  const { stack, preventions, facilities } = data ?? {};

  useEffect(() => {
  if (!stackId) return;

  fetchStack(Number(stackId));
}, [stackId, fetchStack]);
  

  return {
    stackProfile: toStackProfile(stack),
    preventions: toPreventionProfiles(preventions),
    facilities: toFacilityProfiles(facilities),

    loading, error
  }
}