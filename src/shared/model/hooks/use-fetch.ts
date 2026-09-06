import { useCallback, useEffect, useRef, useState } from "react";

import { toErrorMessage } from "@shared/api";
import { ERROR_MESSAGE } from "@shared/config";

interface UseFetchOptions {
  /**
   * 조회 조건. 값이 바뀌면 다시 조회한다.
   * 원시값만 담는다 — 키를 문자열로 이어 붙여 비교하므로 객체를 넣으면 매 렌더 달라진다.
   */
  deps?: readonly (string | number | boolean | null | undefined)[];
  /**
   * false 면 조회하지 않고 로딩도 아니다. 모달이 닫혀 있는 동안 요청을 막는 용도.
   * "입력이 아직 준비되지 않아 대기 중"인 경우는 호출부가 `isLoading` 을 직접 보정한다
   * — 그 둘은 화면에서 다르게 보여야 한다(빈 목록 vs 대기).
   */
  enabled?: boolean;
  /** 조회 조건이 바뀌면 이전 결과를 즉시 버린다. 다른 대상의 값이 잠깐 남아 보이면 안 될 때 켠다. */
  resetOnChange?: boolean;
  /** 요청 자체가 실패했을 때(네트워크 단절 등) 화면에 내보낼 문구. */
  fallbackMessage?: string;
}

/**
 * 마운트 시 자동 조회하고 `refetch()` 로 다시 조회하는 훅(entities 조회 훅 타입 A의 공통 배선).
 *
 * 개별 훅에 흩어져 있던 세 가지 방어를 한곳에 모은다 —
 * **늦게 도착한 응답 무시**(조건을 빠르게 바꿀 때 이전 응답이 새 화면을 덮는 것),
 * **조건 변경 시 렌더 중 상태 되돌리기**(effect 안 동기 setState = cascading render 회피),
 * **성공 시 직전 에러 지우기**.
 *
 * @param fetcher 응답 판정까지 마친 값을 반환한다. 실패는 `unwrapMessage` 로 던진다.
 * @param initialData 조회 전·초기화 시의 값.
 */
export const useFetch = <T>(
  fetcher: () => Promise<T>,
  initialData: T,
  options: UseFetchOptions = {},
) => {
  const {
    deps = [],
    enabled = true,
    resetOnChange = false,
    fallbackMessage = ERROR_MESSAGE.NETWORK,
  } = options;

  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  // fetcher 는 훅 본문에서 매 렌더 새로 만들어진다. 최신 것만 붙잡아 두고
  // effect 는 requestKey 로만 다시 돈다 — 그래야 의존성에 함수가 끼지 않는다.
  // 갱신은 커밋 후에 한다(렌더 중 ref 접근 금지). 아래 조회 effect 보다 먼저 선언해야
  // 같은 커밋에서 최신 fetcher 로 조회된다 — effect 는 선언 순서대로 실행된다.
  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; });

  // 초기값은 첫 렌더의 것으로 고정한다. clear/resetOnChange 가 항상 같은 값으로 되돌리도록.
  const [initial] = useState(initialData);

  // 조회 조건이 바뀌면 렌더 중에 상태를 되돌린다.
  // effect 안에서 동기적으로 setState 하면 cascading render 가 된다.
  const requestKey = `${enabled}|${deps.join("|")}`;
  const [activeKey, setActiveKey] = useState(requestKey);
  if (activeKey !== requestKey) {
    setActiveKey(requestKey);
    setIsLoading(enabled);
    if (resetOnChange) {
      setData(initial);
      setError(null);
    }
  }

  const refetch = useCallback(() => {
    setIsLoading(true);
    setRevision((prev) => prev + 1);
  }, []);

  /** 조회 결과를 초기값으로 되돌린다(선택 해제 등). 다시 조회하지는 않는다. */
  const clear = useCallback(() => {
    setData(initial);
    setError(null);
  }, [initial]);

  useEffect(() => {
    if (!enabled) return;

    // 조건을 빠르게 바꾸면 늦게 도착한 이전 응답이 새 화면을 덮어쓴다.
    let isStale = false;

    fetcherRef.current()
      .then((value) => {
        if (isStale) return;
        setData(value);
        setError(null);
      })
      .catch((err) => { if (!isStale) setError(toErrorMessage(err, fallbackMessage)); })
      .finally(() => { if (!isStale) setIsLoading(false); });

    return () => { isStale = true; };
    // requestKey 가 enabled + deps 전체를 대표한다. 배열을 펼쳐 넣으면 길이가 렌더마다
    // 달라질 수 있어 React 가 경고한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision, requestKey]);

  return { data, isLoading, error, refetch, clear };
};

interface UseLazyFetchOptions {
  /** 첫 조회를 기다리는 화면이면 true. 사용자가 눌러야 조회되는 화면이면 false(기본). */
  initialLoading?: boolean;
  /** 조회를 시작할 때 이전 결과를 즉시 버린다. */
  resetOnFetch?: boolean;
  fallbackMessage?: string;
}

/**
 * 호출부가 명시적으로 불러야 조회되는 훅(entities 조회 훅 타입 B의 공통 배선).
 *
 * 트리거는 **조회한 값을 함께 반환한다** — 저장 충돌 복구처럼 결과를 다음 렌더가 아니라
 * 그 자리에서 대조해야 하는 호출부가 있다. 실패하면 `null` 이며, 예외를 던지지 않는다
 * (조회 실패는 `error` 상태로 화면이 안내하고 흐름은 이어져야 한다).
 */
export const useLazyFetch = <A extends unknown[], T>(
  fetcher: (...args: A) => Promise<T>,
  initialData: T,
  options: UseLazyFetchOptions = {},
) => {
  const {
    initialLoading = false,
    resetOnFetch = false,
    fallbackMessage = ERROR_MESSAGE.FETCH,
  } = options;

  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; });

  const [initial] = useState(initialData);

  const fetch = useCallback(async (...args: A): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    if (resetOnFetch) setData(initial);

    try {
      const value = await fetcherRef.current(...args);
      setData(value);
      return value;
    } catch (err) {
      setError(toErrorMessage(err, fallbackMessage));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [resetOnFetch, fallbackMessage, initial]);

  return { data, isLoading, error, fetch };
};
