import { useEffect } from 'react';

import { useStackDetail } from '@entities/stack';
import { useStackPollutants } from '@entities/stack-pollutant';

import { toStackProfile, toMeasurementProfiles } from './mapper';

export const useStackProfile = (stackId: string | undefined) => {
  const { data, isLoading: loading, error, fetchStack } = useStackDetail();
  const { data: measurements, isLoading: measurementsLoading, fetchStackPollutants } = useStackPollutants();
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
    // 표시용 문자열과 별개로, 수정 폼의 초기값은 원본 값(주기 enum·허용기준·산소보정)이어야 한다.
    stackPollutants: measurements,
    isLoading: loading || measurementsLoading,
    error,
    refetch: () => {
      if (!stackId) return;
      const id = Number(stackId);
      fetchStack(id);
      fetchStackPollutants(id);
    },
  };
}
