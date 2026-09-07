import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toQueryErrorMessage, unwrapMessage } from "@shared/api";

import { scheduleApi } from "../api/api";
import { toScheduleDetail } from "../api/mapper";
import { scheduleKeys } from "./query-keys";
import type { ScheduleDetail } from "./types";

/**
 * 성적서에 실릴 측정항목의 순서 변경.
 *
 * `orderedPollutantIds` 는 이 계획의 측정항목 **전체**여야 하며, 배열 순서가 곧 성적서 표기 순서다.
 * 기록부 서식은 한 장에 실리는 항목 수가 정해져 있어(대기측정기록부 4개) 이 순서가 몇 번째 항목이
 * 몇 번째 장에 들어갈지를 결정한다. 집합이 서버와 다르면(내가 화면을 연 뒤 누군가 항목을
 * 교체했다면) 서버가 저장을 거절한다.
 *
 * **성공해도 무효화하지 않는다.** 서버가 갱신된 상세를 그대로 돌려주므로 그 값을 캐시에 넣으면
 * 재조회할 이유가 없다. 낙관적 반영과 롤백은 `features/update-schedule-items` 가 소유한다
 * (`useReorderFacilitiesAction` 과 같은 근거).
 */
export const useReorderItemsAction = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      orderedPollutantIds,
    }: {
      id: number;
      orderedPollutantIds: number[];
    }): Promise<ScheduleDetail> =>
      toScheduleDetail(unwrapMessage(await scheduleApi.reorderItems(id, { orderedPollutantIds }))),

    onSuccess: (detail, { id }) => {
      queryClient.setQueryData<ScheduleDetail>(scheduleKeys.detail(id), detail);
    },
  });

  const { mutateAsync } = mutation;
  const reorderItems = useCallback(
    (id: number, orderedPollutantIds: number[]) => mutateAsync({ id, orderedPollutantIds }),
    [mutateAsync],
  );

  return { reorderItems, isLoading: mutation.isPending, error: toQueryErrorMessage(mutation.error) };
};
