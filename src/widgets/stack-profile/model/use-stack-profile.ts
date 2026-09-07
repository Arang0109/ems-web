import { useStackDetail } from '@entities/stack';
import { useStackPollutants } from '@entities/stack-pollutant';

import { toStackProfile, toMeasurementProfiles } from './mapper';

export const useStackProfile = (stackId: string | undefined) => {
  const id = stackId ? Number(stackId) : null;

  const { data, isLoading: loading, error, refetch: refetchStack } = useStackDetail(id);
  const {
    data: measurements,
    isLoading: measurementsLoading,
    refetch: refetchStackPollutants,
  } = useStackPollutants(id, { enabled: id != null });

  const { stack, preventions, facilities } = data ?? {};

  return {
    stack: stack ?? null,
    stackId: id,
    stackProfile: toStackProfile(stack as NonNullable<typeof stack>),
    facilities: facilities ?? [],
    preventions: preventions ?? [],
    measurements: toMeasurementProfiles(measurements),
    // 표시용 문자열과 별개로, 수정 폼의 초기값은 원본 값(주기 enum·허용기준·산소보정)이어야 한다.
    stackPollutants: measurements,
    isLoading: loading || measurementsLoading,
    error,
    // 상세와 측정항목은 같은 측정지점을 두 쿼리로 나눠 보므로 함께 무효화한다.
    refetch: () => {
      refetchStack();
      refetchStackPollutants();
    },
  };
}
