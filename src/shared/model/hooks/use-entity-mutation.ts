import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";

import { toQueryErrorMessage } from "@shared/api";
import { ERROR_MESSAGE } from "@shared/config";

interface Options {
  /** 성공 시 무효화할 키들. 액션 훅이 새로 갖는 유일한 책임이다. */
  invalidateKeys?: QueryKey[];
  fallbackMessage?: string;
}

/**
 * 엔티티 액션 훅의 공통 배선 — `useMutation` 을 기존 반환 계약으로 감싼다.
 *
 * **에러를 삼키지 않고 다시 던진다**(`mutateAsync` 계약). 엔티티는 도메인 기능만 알아야 하므로
 * 토스트·모달·화면 이동은 feature 훅이 맡는다. `error` 를 함께 두는 것은 엔티티 자신의 상태를 위해서다.
 *
 * `run` 은 **참조가 고정**돼 있고 인자를 그대로 넘긴다 — `useMutation` 이 변수 하나만 받는 것을
 * 배열로 싸서 가린다. 호출부는 `updateClient(id, data)` 처럼 예전 그대로 쓴다.
 *
 * 낙관적 업데이트·409 분기처럼 mutation 수명주기에 개입해야 하는 훅은 이것을 쓰지 말고
 * `useMutation` 을 직접 조립한다.
 */
export const useEntityMutation = <A extends unknown[], R>(
  action: (...args: A) => Promise<R>,
  { invalidateKeys = [], fallbackMessage = ERROR_MESSAGE.NETWORK }: Options = {},
) => {
  const queryClient = useQueryClient();

  // action·키 배열 모두 렌더마다 새로 만들어진다. 최신 것만 붙잡아 두고 참조를 고정한다.
  const actionRef = useRef(action);
  const keysRef = useRef(invalidateKeys);
  useEffect(() => {
    actionRef.current = action;
    keysRef.current = invalidateKeys;
  });

  const mutation = useMutation({
    mutationFn: (args: A) => actionRef.current(...args),
    onSuccess: () => {
      keysRef.current.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
    },
  });

  const { mutateAsync } = mutation;
  const run = useCallback((...args: A): Promise<R> => mutateAsync(args), [mutateAsync]);

  return {
    run,
    isLoading: mutation.isPending,
    error: toQueryErrorMessage(mutation.error, fallbackMessage),
  };
};
