import type { AxiosResponse } from "axios";

import { ERROR_MESSAGE } from "@shared/config";
import type { ApiResponseMessage } from "@shared/model";

/**
 * HTTP 상태 코드를 보존하는 API 에러.
 *
 * `axiosPrivate` 의 응답 인터셉터는 에러 응답을 `Promise.resolve` 로 되돌려 주므로
 * (401 refresh 재시도 흐름을 위해) 호출부에는 `res.data.message` 만 남고 상태 코드가 사라진다.
 * 409(충돌)처럼 **다른 실패와 다르게 대응해야 하는 응답**은 그 구분이 필요하므로,
 * `unwrap` 을 거친 API 함수는 문자열 대신 이 에러를 던진다.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  /** 다른 사용자가 먼저 저장했거나 현재 상태에서 허용되지 않는 요청 */
  get isConflict() {
    return this.status === 409;
  }
}

/**
 * 성공 응답의 본문을 꺼내고, 실패 응답은 `ApiError` 로 던진다.
 * 상태 코드를 구분해야 하는 엔드포인트에서만 쓴다 — 나머지는 기존처럼 `res.data` 를 그대로 반환한다.
 */
export const unwrap = <T>(res: AxiosResponse<ApiResponseMessage<T>>): T => {
  if (!res.data?.status) {
    throw new ApiError(res.status, res.data?.message ?? ERROR_MESSAGE.NETWORK);
  }
  return res.data.data;
};
