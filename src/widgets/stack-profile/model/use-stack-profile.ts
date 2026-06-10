import { useEffect } from 'react';

import { useStackDetail } from '@entities/stack';
import { useStackMeasurements } from '@entities/stack-measurement';

import { toStackProfile, toPreventionProfiles, toFacilityProfiles, toMeasurementProfiles } from './mapper';

export const useStackProfile = (stackId: string | undefined) => {
  const { data, loading, error, fetchStack } = useStackDetail();
  const { data: measurements, loading: measurementsLoading, fetchStackMeasurements } = useStackMeasurements();
  const { stack, preventions, facilities } = data ?? {};

  useEffect(() => {
    if (!stackId) return;
    const id = Number(stackId);
    fetchStack(id);
    fetchStackMeasurements(id);
  }, [stackId, fetchStack, fetchStackMeasurements]);

  return {
    stack: stack ?? null,
    stackProfile: toStackProfile(stack),
    preventions: toPreventionProfiles(preventions),
    facilities: toFacilityProfiles(facilities),
    measurements: toMeasurementProfiles(measurements),
    loading: loading || measurementsLoading,
    error,
    refetch: () => {
      if (!stackId) return;
      const id = Number(stackId);
      fetchStack(id);
      fetchStackMeasurements(id);
    },
  };
}
