import type { AxiosResponse } from "axios";

import { parseAttachmentFilename } from "@shared/lib";

import { ApiResponseError } from "./response";

// 성공은 파일(바이너리), 실패는 JSON으로 내려오는 다운로드 API 전용 헬퍼.
// responseType:'blob'이면 에러 본문도 Blob으로 오기 때문에 텍스트로 되읽어 메시지를 꺼낸다.
// 서버 에러 스키마가 { status, message, data }와 { success, message } 두 가지지만 message 키는 공통이다.
export const readBlobErrorMessage = async (blob: Blob): Promise<string | null> => {
  try {
    const parsed: unknown = JSON.parse(await blob.text());

    if (parsed && typeof parsed === 'object' && 'message' in parsed) {
      const { message } = parsed as { message?: unknown };
      return typeof message === 'string' && message.trim() ? message : null;
    }

    return null;
  } catch {
    // JSON이 아니면(프록시 HTML 에러 등) 메시지를 얻을 수 없다 — 호출부 폴백에 맡긴다.
    return null;
  }
};

interface UnwrapBlobOptions {
  /** 서버 문구도, 상태별 문구도 없을 때의 실패 문구 */
  fallbackMessage: string;
  /** HTTP 상태별 실패 문구 — 서버가 message 를 주면 그쪽이 우선이다 */
  messageByStatus?: Record<number, string>;
  /** `Content-Disposition` 에서 파일명을 못 얻었을 때 쓸 이름 */
  fallbackFilename: string;
}

/**
 * 파일 다운로드 응답을 `{ blob, filename }` 으로 푼다. 실패면 `ApiResponseError`(HTTP status 포함)를 던진다.
 *
 * 성공 응답이 바이너리라 봉투의 `status` 로 성공을 볼 수 없고, `axiosPrivate` 인터셉터가 에러 응답도
 * resolve 로 넘기므로 HTTP 상태 코드로 판별한다. 실패 본문도 Blob 으로 오므로 되읽어 서버 문구를 꺼낸다.
 * 문서·채취기록지·채팅 첨부 다운로드가 같은 흐름을 각자 복사하던 것을 모았다.
 */
export const unwrapBlob = async (
  res: AxiosResponse<Blob>,
  { fallbackMessage, messageByStatus = {}, fallbackFilename }: UnwrapBlobOptions,
): Promise<{ blob: Blob; filename: string }> => {
  if (res.status < 200 || res.status >= 300) {
    const serverMessage = await readBlobErrorMessage(res.data);
    throw new ApiResponseError(serverMessage ?? messageByStatus[res.status] ?? fallbackMessage, res.status);
  }

  // axios 헤더 값 타입이 string으로 좁혀지지 않아 문자열일 때만 파싱한다.
  const disposition = res.headers["content-disposition"];

  return {
    blob: res.data,
    filename: parseAttachmentFilename(typeof disposition === "string" ? disposition : undefined) || fallbackFilename,
  };
};
