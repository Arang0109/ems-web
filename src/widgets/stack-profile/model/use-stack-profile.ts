import { useEffect } from 'react';

import { useStackDetail } from '@entities/stack';
import { useStackPollutants } from '@entities/stack-pollutant';

import { toStackProfile, toMeasurementProfiles } from './mapper';

export const useStackProfile = (stackId: string | undefined) => {
  const { data, loading, error, fetchStack } = useStackDetail();
  const { data: measurements, loading: measurementsLoading, fetchStackPollutants } = useStackPollutants();
  const { stack, preventions, facilities } = data ?? {};

  useEffect(() => {
    if (!stackId) return;
    const id = Number(stackId);
    fetchStack(id);
    fetchStackPollutants(id);
  }, [stackId, fetchStack, fetchStackPollutants]);

  return {
    stack: stack ?? null,
    stackId: stackId ? Number(stackId) : null,
    stackProfile: toStackProfile(stack as NonNullable<typeof stack>),
    facilities: facilities ?? [],
    preventions: preventions ?? [],
    measurements: toMeasurementProfiles(measurements),
    loading: loading || measurementsLoading,
    error,
    refetch: () => {
      if (!stackId) return;
      const id = Number(stackId);
      fetchStack(id);
      fetchStackPollutants(id);
    },
  };
}
