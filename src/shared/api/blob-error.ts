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
