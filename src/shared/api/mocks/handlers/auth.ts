import { http, HttpResponse } from 'msw';

import { memberList } from './member';

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
          // 플랫폼 운영자는 tenant 회원이 아니라 memberList 에 없다 — 겹치지 않는 id 를 쓴다
          userId: 99,
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
          // memberList 의 1번(admin/김관리). 채팅이 내 메시지를 senderId 로 가려내므로
          // 목 회원 id 와 어긋나면 목 환경에서 말풍선 좌우가 통째로 뒤집힌다.
          userId: 1,
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

export const userHandlers = [
  // 선택지(드롭다운)용 사용자 목록. 서버 `UserListResponse` 와 같은 규격이라
  // 로그인 아이디·이메일·연락처는 내리지 않는다 — 그 필드가 필요한 관리 화면은
  // ADMIN 전용인 `/admin/members` 가 담당한다.
  // 회원 목 데이터에서 파생시킨다. 따로 적어 두면 team.ts 의 사수·부사수 id 와 어긋난다.
  http.get(`${BASE_URL}/users`, () => {
    return HttpResponse.json({
      status: true,
      message: '사용자 목록 조회 성공',
      data: memberList.map((m) => ({
        userId: m.id,
        name: m.name,
        department: m.department,
        role: m.role,
      })),
    });
  }),
];
