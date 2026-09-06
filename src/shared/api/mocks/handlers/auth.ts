import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

export const authHandlers = [
  http.post(`${BASE_URL}/auth/sign-in`, async ({ request }) => {
    const body = await request.json() as { username: string; password: string };

    // 플랫폼 운영자(전역) 목 로그인 — /platform 콘솔 접근 테스트용
    if (body.username === 'platform' && body.password === '1234') {
      return HttpResponse.json({
        status: true,
        message: '로그인 성공',
        data: {
          accessToken: 'mock-platform-token-xyz',
          tenant: '플랫폼',
          username: body.username,
          name: '운영자',
          // 플랫폼 운영자는 tenant 소속이 아니라 팀이 없다 — 팀 미배정 경로 확인용
          teamId: null,
          teamName: null,
          role: 'PLATFORM_ADMIN',
        },
      });
    }

    if (body.username === 'admin' && body.password === '1234') {
      return HttpResponse.json({
        status: true,
        message: '로그인 성공',
        data: {
          accessToken: 'mock-access-token-xyz',
          tenant: '엔솔루션',
          username: body.username,
          name: '김관리',
          // team.ts 목 데이터의 1번 팀. 측정계획 목록·대시보드의 "내 팀" 기본 필터 확인용
          teamId: 1,
          teamName: '대기측정 1팀',
          role: 'ADMIN', // 관리자 페이지 접근 테스트용. 일반 사용자 흐름 확인 시 'USER'로 변경
        },
      });
    }

    return HttpResponse.json(
      {
        status: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.',
        data: null,
      },
      { status: 401 },
    );
  }),

  http.post(`${BASE_URL}/auth/sign-out`, () => {
    return HttpResponse.json({
      status: true,
      message: '로그아웃 성공',
      data: null,
    });
  }),

  http.post(`${BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      status: true,
      message: '토큰 갱신 성공',
      // 서버는 새 accessToken 문자열을 data에 그대로 담는다(객체로 감싸지 않는다).
      data: 'mock-refreshed-token-xyz',
    });
  }),
];
