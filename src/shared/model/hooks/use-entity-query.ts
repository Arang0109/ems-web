import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";

import { toQueryErrorMessage } from "@shared/api";
import { ERROR_MESSAGE } from "@shared/config";

interface Options<T> {
  queryKey: QueryKey;
  /** 응답 판정까지 마친 값을 반환한다. 실패는 `unwrapMessage`/`unwrap` 이 던진다. */
  queryFn: () => Promise<T>;
  /** 조회 전·비활성 상태에서 돌려줄 값. `useFetch` 의 `initialData` 자리다. */
  initialData: T;
  /** false 면 조회하지 않고 로딩도 아니다. */
  enabled?: boolean;
  /** 거의 바뀌지 않는 마스터 데이터만 길게 잡는다. 기본값은 `queryClient` 가 정한다. */
  staleTime?: number;
  /**
   * `refetch()` 가 무효화할 범위. 기본은 자기 키다.
   * 목록 훅은 보통 `keys.lists()` 를 넘겨 필터가 다른 목록까지 함께 갱신한다.
   */
  invalidateKey?: QueryKey;
  fallbackMessage?: string;
}

/**
 * 엔티티 조회 훅의 공통 배선 — `useQuery` 를 기존 반환 계약으로 감싼다.
 *
 * **`refetch` 의 의미가 달라졌다.** 예전에는 그 훅 인스턴스만 다시 불렀지만, 이제
 * `invalidateQueries` 로 **같은 키를 구독하는 모든 곳**을 갱신한다. 호출부 코드는 그대로 두고
 * 동작만 인스턴스 단위에서 키 단위로 넓어진다.
 *
 * 늦게 도착한 응답 무시·조건 변경 시 이전 값 버리기는 react-query 가 소유한다 —
 * **`placeholderData` 를 지정하지 말 것.** 지정하는 순간 키가 바뀌어도 이전 대상의 값이
 * 잠깐 남아 보인다(예전 `resetOnChange: true` 가 막던 회귀다).
 */
export const useEntityQuery = <T>({
  queryKey,
  queryFn,
  initialData,
  enabled = true,
  staleTime,
  invalidateKey,
  fallbackMessage = ERROR_MESSAGE.NETWORK,
}: Options<T>) => {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey, queryFn, enabled, staleTime });

  // 첫 렌더의 것으로 고정한다. `query.data ?? initialData` 에 매 렌더 새 `[]` 를 넘기면
  // 참조가 달라져 호출부의 `useMemo([data])` 가 매번 다시 돈다.
  const [fallbackValue] = useState(initialData);

  // 무효화 대상은 렌더마다 새 배열이라 의존성에 넣을 수 없다. 최신 것만 붙잡아 두고
  // `refetch` 의 참조는 고정한다 — 호출부가 의존성 배열에 넣어도 루프가 생기지 않는다.
  const targetRef = useRef<QueryKey>(invalidateKey ?? queryKey);
  useEffect(() => {
    targetRef.current = invalidateKey ?? queryKey;
  });

  // 갱신이 끝날 때까지 기다려야 하는 호출부가 있어 Promise 를 돌려준다
  // (저장 직후 서버 값으로 폼을 되맞추는 흐름). 무시해도 무해하다.
  const refetch = useCallback(
    () => queryClient.invalidateQueries({ queryKey: targetRef.current }),
    [queryClient],
  );

  return {
    data: query.data ?? fallbackValue,
    isLoading: query.isLoading,
    /** 캐시된 값을 보여주면서 뒤에서 갱신 중인 상태. 배경 갱신 표시에 쓴다. */
    isFetching: query.isFetching,
    error: toQueryErrorMessage(query.error, fallbackMessage),
    refetch,
  };
};
