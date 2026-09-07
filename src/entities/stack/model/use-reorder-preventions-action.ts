import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toQueryErrorMessage, unwrapMessage } from "@shared/api";

import { stackApi } from "../api/api";
import { stackKeys } from "./query-keys";
import type { StackDetail } from "./types";

/**
 * 방지시설 표시 순서 변경. 배출시설(`useReorderFacilitiesAction`)과 같은 계약이며,
 * **성공해도 무효화하지 않고 캐시를 직접 고쳐 넣는 것**까지 같다 — 근거는 그쪽 주석 참조.
 */
export const useReorderPreventionsAction = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ stackId, orderedIds }: { stackId: number; orderedIds: number[] }) => {
      unwrapMessage(await stackApi.reorderPreventions({ stackId, orderedIds }));
    },

    onSuccess: (_data, { stackId, orderedIds }) => {
      const key = stackKeys.detail(stackId);
      const cached = queryClient.getQueryData<StackDetail>(key);
      if (!cached) return;

      const byId = new Map(cached.preventions.map((prevention) => [prevention.id, prevention]));
      queryClient.setQueryData<StackDetail>(key, {
        ...cached,
        preventions: orderedIds.flatMap((id) => byId.get(id) ?? []),
      });
    },
  });

  const { mutateAsync } = mutation;
  const reorderPreventions = useCallback(
    (stackId: number, orderedIds: number[]) => mutateAsync({ stackId, orderedIds }),
    [mutateAsync],
  );

  return { reorderPreventions, isLoading: mutation.isPending, error: toQueryErrorMessage(mutation.error) };
};
