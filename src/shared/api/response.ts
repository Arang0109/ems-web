import { ERROR_MESSAGE } from "@shared/config";
import type { ApiResponseMessage } from "@shared/model";

/**
 * 서버가 `status: false` 로 응답한 경우.
 *
 * **요청 자체가 던진 실패(네트워크 단절 등)와 구분하기 위해 클래스를 나눈다.** 훅은 이 에러의
 * 메시지만 화면에 그대로 내보내고, 그 밖의 에러는 표준 문구로 바꾼다 — axios 내부 문구가
 * 사용자에게 노출되면 무슨 일이 났는지 알 수 없는 영어 문장이 토스트에 뜬다.
 *
 * 상태 코드까지 구분해야 하는 경로는 이것이 아니라 {@link ApiError}(`unwrap`)를 쓴다.
 */
export class ApiResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiResponseError";
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

/** 화면에 내보낼 실패 문구. 서버가 준 문구만 그대로 쓰고 나머지는 표준 문구로 덮는다. */
export const toErrorMessage = (err: unknown, fallbackMessage: string): string =>
  err instanceof ApiResponseError ? err.message : fallbackMessage;
