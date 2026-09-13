import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toQueryErrorMessage, unwrapMessage } from "@shared/api";

import { pollutantCatalogApi } from "../api/api";
import { pollutantCatalogKeys } from "./query-keys";
import type { PollutantCatalog } from "./types";

/**
 * 카탈로그 폐지/해제.
 *
 * 삭제 API 가 따로 없는 것은 의도된 설계다 — 이미 그 물질을 등록해 쓰고 있는 고객사와
 * 과거 측정계획 스냅샷이 있으므로, 지우는 대신 선택 목록에서만 감춘다.
 *
 * **낙관적으로 반영한다.** 스위치를 누른 뒤 응답을 기다리는 동안 꺼진 채로 남아 있으면
 * 눌리지 않은 것으로 읽힌다. 실패하면 이전 목록으로 되돌린다.
 */
export const useTogglePollutantCatalogAction = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      unwrapMessage(
        active
          ? await pollutantCatalogApi.activatePollutantCatalog(id)
          : await pollutantCatalogApi.deactivatePollutantCatalog(id),
      );
    },

    onMutate: async ({ id, active }) => {
      // 진행 중인 조회가 나중에 도착해 낙관적 값을 덮어쓰는 것을 막는다.
      await queryClient.cancelQueries({ queryKey: pollutantCatalogKeys.lists() });

      // 필터 조합마다 캐시가 따로라 해당하는 목록을 전부 손본다.
      const snapshots = queryClient.getQueriesData<PollutantCatalog[]>({
        queryKey: pollutantCatalogKeys.lists(),
      });

      snapshots.forEach(([key, list]) => {
        if (!list) return;
        queryClient.setQueryData<PollutantCatalog[]>(
          key,
          list.map((item) => (item.id === id ? { ...item, active } : item)),
        );
      });

      return { snapshots };
    },

    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([key, list]) => queryClient.setQueryData(key, list));
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: pollutantCatalogKeys.all });
    },
  });

  const { mutateAsync } = mutation;
  const setPollutantCatalogActive = useCallback(
    (id: number, active: boolean) => mutateAsync({ id, active }),
    [mutateAsync],
  );

  return {
    setPollutantCatalogActive,
    isLoading: mutation.isPending,
    error: toQueryErrorMessage(mutation.error),
  };
};
