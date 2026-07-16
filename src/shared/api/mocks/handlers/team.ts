import { http, HttpResponse } from 'msw';

import { memberList } from './member';

const BASE_URL = 'http://localhost:8080/api';

const memberName = (userId: number | null | undefined): string =>
  memberList.find((m) => m.id === userId)?.name ?? '';

type MockTeam = {
  id: number;
  name: string;
  mentorUserId: number;
  menteeUserId: number;
  particleSamplerId: string;
  gasSamplerId: string;
  pitotTubeId: string;
  nozzleId: string;
};

let teams: MockTeam[] = [
  {
    id: 1, name: '대기측정 1팀',
    mentorUserId: 3, menteeUserId: 5,
    particleSamplerId: '1', gasSamplerId: '3', pitotTubeId: '4', nozzleId: '5',
  },
  {
    id: 2, name: '대기측정 2팀',
    mentorUserId: 2, menteeUserId: 4,
    particleSamplerId: '2', gasSamplerId: '3', pitotTubeId: '4', nozzleId: '5',
  },
];

// 저장 레코드(id 참조) → 응답(이름 조립) 변환
const toResponse = (team: MockTeam) => ({
  ...team,
  mentorName: memberName(team.mentorUserId),
  menteeName: memberName(team.menteeUserId),
});

export const teamHandlers = [
  // 상세 조회 (구체 경로 우선)
  http.get(`${BASE_URL}/teams/:teamId`, ({ params }) => {
    const target = teams.find((t) => t.id === Number(params.teamId));
    if (!target) {
      return HttpResponse.json({ status: false, message: '팀을 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    return HttpResponse.json({ status: true, message: '팀 조회 성공', data: toResponse(target) });
  }),

  // 목록 조회
  http.get(`${BASE_URL}/teams`, () => {
    return HttpResponse.json({
      status: true,
      message: '팀 목록 조회 성공',
      data: teams.map(toResponse),
    });
  }),

  // 등록
  http.post(`${BASE_URL}/teams`, async ({ request }) => {
    const body = await request.json() as Omit<MockTeam, 'id'>;
    const created: MockTeam = { id: Date.now(), ...body };
    teams = [created, ...teams];
    return HttpResponse.json({ status: true, message: '팀 등록 성공', data: toResponse(created) }, { status: 201 });
  }),

  // 수정
  http.put(`${BASE_URL}/teams/:teamId`, async ({ params, request }) => {
    const body = await request.json() as Partial<MockTeam>;
    const target = teams.find((t) => t.id === Number(params.teamId));
    if (!target) {
      return HttpResponse.json({ status: false, message: '팀을 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    Object.assign(target, body, { id: target.id });
    return HttpResponse.json({ status: true, message: '팀 수정 성공', data: toResponse(target) });
  }),

  // 삭제
  http.delete(`${BASE_URL}/teams/:teamId`, ({ params }) => {
    teams = teams.filter((t) => t.id !== Number(params.teamId));
    return HttpResponse.json({ status: true, message: `${params.teamId} 삭제 완료`, data: null });
  }),
];
