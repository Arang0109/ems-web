import { HttpResponse } from 'msw';

/**
 * 목 핸들러가 가로챌 API 주소 — axios 인스턴스와 **같은 env** 에서 파생한다.
 * 하드코딩해 두면 `VITE_API_URL` 을 바꿨을 때(예: 프록시용 `/api`) 목이 조용히 전부 빗나간다.
 */
export const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

type ResponseInit = Parameters<typeof HttpResponse.json>[1];

/**
 * 서버 응답 봉투 `{ status, message, data }` — 실제 API(`ApiResponseMessage`)와 같은 모양.
 * 핸들러가 매번 객체를 손으로 적으면 필드가 하나씩 빠진다.
 */
export const ok = <T>(data: T, message = '', init?: ResponseInit) =>
  HttpResponse.json({ status: true, message, data }, init);

export const fail = (message: string, init?: ResponseInit) =>
  HttpResponse.json({ status: false, message, data: null }, init);
