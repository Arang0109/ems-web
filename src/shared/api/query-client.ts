import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "./api-error";
import { ApiResponseError } from "./response";

/**
 * 앱 전역 쿼리 캐시.
 *
 * **재시도 정책이 이 파일의 핵심이다.** `axiosPrivate` 의 응답 인터셉터는 에러 응답을
 * `Promise.resolve` 로 되돌린다(401 재발급 재시도 흐름 때문). 그래서 업무 실패는 예외가 아니라
 * `status:false` 로 도착하고, `unwrapMessage`/`unwrap` 이 그 자리에서 던진다.
 * react-query 기본값(`retry: 3`)을 그대로 두면 **권한 없음·검증 실패·409 같은 서버 판정을
 * 3번씩 되묻게 된다** — 답이 바뀌지 않는 요청이고, 409 는 되레 충돌 복구 흐름을 방해한다.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // 현장 입력 화면이 1순위다. 포커스가 돌아올 때마다 재조회하면 작성 중인 폼 아래에서
      // 목록이 흔들린다. 갱신은 mutation 의 무효화가 책임진다.
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        error instanceof ApiResponseError || error instanceof ApiError
          ? false
          : failureCount < 2,
    },
    mutations: {
      // 등록·저장·파일 생성을 자동 재시도하면 중복 부수효과가 난다.
      retry: false,
    },
  },
});
