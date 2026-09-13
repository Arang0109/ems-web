/**
 * 첨부 한도 10MB — 서버 `ChatAttachment.MAX_SIZE_BYTES` 와 같은 값이다.
 *
 * 보내기 전에 걸러 내려고 프론트에도 둔다. 서버까지 갔다 오면 10MB 를 업로드한 뒤에야
 * 413 을 받는다.
 */
export const CHAT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

/** 메시지 한 페이지 크기. 서버 기본값과 같다(상한은 100) */
export const CHAT_PAGE_SIZE = 50;

/** 본문 최대 길이 — 서버 `@Size(max = 4000)` */
export const CHAT_CONTENT_MAX_LENGTH = 4000;
