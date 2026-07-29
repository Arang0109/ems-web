// Content-Disposition 헤더에서 첨부 파일명을 추출한다.
// 서버는 한글 파일명을 RFC 5987 형식(filename*=UTF-8''<퍼센트인코딩>)으로만 내려주므로 그 경로가 기본이다.
export const parseAttachmentFilename = (header?: string): string | null => {
  if (!header) return null;

  const encoded = /filename\*\s*=\s*([^']*)'[^']*'([^;]+)/i.exec(header);
  if (encoded) {
    try {
      return decodeURIComponent(encoded[2].trim());
    } catch {
      // 퍼센트 인코딩이 깨진 경우 아래 비-star 파라미터로 폴백한다.
    }
  }

  // filename="xxx" (ASCII 전용) 폴백 — 서버가 헤더 형식을 바꿔도 깨지지 않도록 남겨둔다.
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : null;
};
