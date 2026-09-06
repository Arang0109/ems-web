import { useCallback, useEffect, useRef, useState } from "react";

import { toErrorMessage } from "@shared/api";
import { ERROR_MESSAGE } from "@shared/config";

/**
 * 실행형 API 호출(등록·수정·삭제 등)의 공통 배선 — `isLoading`·`error` 상태와 실패 처리.
 *
 * **에러를 삼키지 않고 다시 던진다.** 엔티티 레이어는 도메인 기능만 알아야 하므로
 * 토스트·모달·화면 이동 같은 후처리는 feature 훅이 맡는다(`entities/CLAUDE.md`).
 * 여기서 잡는 것은 "엔티티 자신이 들고 있어야 하는 `error` 상태"를 채우기 위해서다.
 *
 * 반환하는 `run` 은 **참조가 고정**돼 있다. 호출부가 `useEffect` 의존성에 넣거나
 * `useCallback` 으로 감쌀 때 매 렌더 새 함수가 되어 무한 루프가 되는 것을 막는다.
 *
 * @param action 실제 호출. 응답 판정은 `unwrapMessage` 로 하고 실패는 던진다.
 * @param fallbackMessage 서버 문구가 없을 때 화면에 내보낼 표준 문구.
 */
export const useAsyncAction = <A extends unknown[], R>(
  action: (...args: A) => Promise<R>,
  fallbackMessage: string = ERROR_MESSAGE.NETWORK,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // action 은 훅 본문에서 매 렌더 새로 만들어지므로 ref 로 최신 것만 붙잡는다.
  // 이렇게 해야 run 의 참조를 고정할 수 있다.
  // 렌더 중에 ref 를 쓰지 않고 커밋 후에 갱신한다 — run 은 이벤트 핸들러에서만 불리므로
  // 그 시점에는 언제나 최신이다.
  const actionRef = useRef(action);
  useEffect(() => { actionRef.current = action; });

  const run = useCallback(async (...args: A): Promise<R> => {
    setIsLoading(true);
    setError(null);

    try {
      return await actionRef.current(...args);
    } catch (err) {
      setError(toErrorMessage(err, fallbackMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fallbackMessage]);

  return { run, isLoading, error };
};
