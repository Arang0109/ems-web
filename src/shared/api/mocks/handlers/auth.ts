import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

export const authHandlers = [
  http.post(`${BASE_URL}/auth/sign-in`, async ({ request }) => {
    const body = await request.json() as { username: string; password: string };

    if (body.username === 'admin' && body.password === '1234') {
      return HttpResponse.json({
        status: true,
        message: '로그인 성공',
        data: {
          accessToken: 'mock-access-token-xyz',
          username: body.username,
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
      data: {
        accessToken: 'mock-refreshed-token-xyz',
      },
    });
  }),
];
