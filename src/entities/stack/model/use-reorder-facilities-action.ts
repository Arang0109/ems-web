import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toQueryErrorMessage, unwrapMessage } from "@shared/api";

import { stackApi } from "../api/api";
import { stackKeys } from "./query-keys";
import type { StackDetail } from "./types";

/**
 * 배출시설 표시 순서 변경.
 *
 * `orderedIds` 는 이 측정지점의 배출시설 **전체**여야 하며, 배열 순서가 곧 표시 순위다.
 * 집합이 서버와 다르면(내가 화면을 연 뒤 누군가 시설을 추가·삭제했다면) 서버가 저장을 거절한다.
 *
 * **성공해도 무효화하지 않고 캐시를 직접 고쳐 넣는다.** 낙관적 반영과 롤백은 이미
 * `features/update-facility` 의 `useReorderFacilities` 가 요청 경합까지 포함해 소유하고 있고,
 * 여기서 재조회를 걸면 상세가 다시 로드되며 목록이 깜빡이고 아코디언이 전부 닫힌다
 * (그 훅 주석에 명시된 결정이다). 서버는 우리가 보낸 순서를 그대로 저장했으므로
 * 캐시를 같은 순서로 맞춰 두면 재조회 없이도 캐시가 사실과 일치한다.
 */
export const useReorderFacilitiesAction = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ stackId, orderedIds }: { stackId: number; orderedIds: number[] }) => {
      unwrapMessage(await stackApi.reorderFacilities({ stackId, orderedIds }));
    },

    onSuccess: (_data, { stackId, orderedIds }) => {
      const key = stackKeys.detail(stackId);
      const cached = queryClient.getQueryData<StackDetail>(key);
      if (!cached) return;

      // 서버가 저장한 순서 그대로 캐시를 재배열한다. 목록에 없는 id 는 무시된다.
      const byId = new Map(cached.facilities.map((facility) => [facility.id, facility]));
      queryClient.setQueryData<StackDetail>(key, {
        ...cached,
        facilities: orderedIds.flatMap((id) => byId.get(id) ?? []),
      });
    },
  });

  const { mutateAsync } = mutation;
  const reorderFacilities = useCallback(
    (stackId: number, orderedIds: number[]) => mutateAsync({ stackId, orderedIds }),
    [mutateAsync],
  );

  return { reorderFacilities, isLoading: mutation.isPending, error: toQueryErrorMessage(mutation.error) };
};
