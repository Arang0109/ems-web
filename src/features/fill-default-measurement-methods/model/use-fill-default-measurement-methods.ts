import { useQueryClient } from "@tanstack/react-query";

import { useEnsureDefaultMeasurementMethodsAction } from "@entities/measurement-method";
import { pollutantKeys } from "@entities/pollutant";

import { toast } from "@shared/ui/toasts";

interface Props {
  /** 현재 목록 크기. 몇 종이 새로 생겼는지 알려 주기 위해 받는다 */
  currentCount: number;
}

/**
 * 기본 8종(먼지·중금속·수은·현장측정·흡수액·흡착관·테드라백·카트리지) 채우기.
 *
 * 서버가 이름 기준으로 멱등하게 처리하므로 확인 없이 바로 부른다 — 이미 있는 이름은 손대지 않고
 * 고친 값도 되돌리지 않는다. 새 고객사가 측정물질을 채택하기 전에 한 번 누르는 용도다.
 */
export const useFillDefaultMeasurementMethods = ({ currentCount }: Props) => {
  const { ensureDefaultMeasurementMethods, isLoading } = useEnsureDefaultMeasurementMethodsAction();
  const queryClient = useQueryClient();

  const handleFill = async () => {
    try {
      const methods = await ensureDefaultMeasurementMethods();
      const added = methods.length - currentCount;
      // 측정방법이 생기면 측정물질 목록의 투영값(레거시 행)은 그대로지만, 후보 선택지는 바뀐다.
      void queryClient.invalidateQueries({ queryKey: pollutantKeys.all });
      toast.success(added > 0 ? `기본 측정방법 ${added}종을 추가했습니다.` : "기본 측정방법이 이미 모두 있습니다.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "기본 측정방법을 채우지 못했습니다.";
      toast.error(message);
    }
  };

  return { isLoading, handleFill };
};
