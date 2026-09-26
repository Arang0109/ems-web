import type { AxiosResponse } from "axios";

import { ERROR_MESSAGE } from "@shared/config";
import type { ApiResponseMessage } from "@shared/model";

/**
 * 서버가 `status: false` 로 응답한 경우.
 *
 * **요청 자체가 던진 실패(네트워크 단절 등)와 구분하기 위해 클래스를 나눈다.** 훅은 이 에러의
 * 메시지만 화면에 그대로 내보내고, 그 밖의 에러는 표준 문구로 바꾼다 — axios 내부 문구가
 * 사용자에게 노출되면 무슨 일이 났는지 알 수 없는 영어 문장이 토스트에 뜬다.
 *
 * `status` 는 HTTP 상태 코드다. `unwrap`(axios 응답 전체를 받는 경로)만 채운다 — 409(충돌)처럼
 * 다른 실패와 다르게 대응해야 하는 엔드포인트가 쓴다. 본문만 받는 `unwrapMessage` 에는 없다.
 */
export class ApiResponseError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiResponseError";
    this.status = status;
  }

  /** 다른 사용자가 먼저 저장했거나 현재 상태에서 허용되지 않는 요청 */
  get isConflict() {
    return this.status === 409;
  }
}

/**
 * 성공 응답의 본문을 꺼내고, 실패 응답은 {@link ApiResponseError} 로 던진다.
 *
 * `axiosPrivate` 의 응답 인터셉터가 에러 응답을 resolve 로 되돌리므로(401 재발급 흐름)
 * 실패는 예외가 아니라 `status: false` 로 도착한다. 그 분기를 훅마다 손으로 쓰지 않게 모은다.
 */
export const unwrapMessage = <T>(
  res: ApiResponseMessage<T>,
  fallbackMessage: string = ERROR_MESSAGE.NETWORK,
): T => {
  if (!res.status) throw new ApiResponseError(res.message || fallbackMessage);
  return res.data;
};

/**
 * `unwrapMessage` 의 상태 코드 보존판 — axios 응답 전체를 받아, 실패면 HTTP 상태 코드를 실어 던진다.
 * 인터셉터가 에러 응답을 resolve 로 되돌려 호출부에는 상태 코드가 `res.status` 에만 남기 때문이다.
 * 상태 코드로 분기할 엔드포인트에서만 쓴다.
 */
export const unwrap = <T>(res: AxiosResponse<ApiResponseMessage<T>>): T => {
  if (!res.data?.status) {
    throw new ApiResponseError(res.data?.message || ERROR_MESSAGE.NETWORK, res.status);
  }
  return res.data.data;
};

/** 화면에 내보낼 실패 문구. 서버가 준 문구만 그대로 쓰고 나머지는 표준 문구로 덮는다. */
export const toErrorMessage = (err: unknown, fallbackMessage: string): string =>
  err instanceof ApiResponseError ? err.message : fallbackMessage;

/**
 * 쿼리·뮤테이션의 에러를 화면 문구로 바꾼다. `toErrorMessage` 의 react-query 판(`null` 통과).
 *
 * 엔티티 훅이 `error: string | null` 계약을 유지하기 위해 쓴다 — react-query 는 `Error` 객체를
 * 주지만, 화면은 서버가 준 문구 한 줄만 필요하다.
 */
export const toQueryErrorMessage = (
  err: unknown,
  fallbackMessage: string = ERROR_MESSAGE.NETWORK,
): string | null => (err == null ? null : toErrorMessage(err, fallbackMessage));
