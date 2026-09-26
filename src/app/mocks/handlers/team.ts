import { http } from 'msw';

import { memberList } from './member';

import { BASE_URL, ok, fail } from '../utils';

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
      return fail('팀을 찾을 수 없습니다.', { status: 404 });
    }
    return ok(toResponse(target), '팀 조회 성공');
  }),

  // 목록 조회
  http.get(`${BASE_URL}/teams`, () => {
    return ok(teams.map(toResponse), '팀 목록 조회 성공');
  }),

  // 등록
  http.post(`${BASE_URL}/teams`, async ({ request }) => {
    const body = await request.json() as Omit<MockTeam, 'id'>;
    const created: MockTeam = { id: Date.now(), ...body };
    teams = [created, ...teams];
    return ok(toResponse(created), '팀 등록 성공', { status: 201 });
  }),

  // 수정
  http.put(`${BASE_URL}/teams/:teamId`, async ({ params, request }) => {
    const body = await request.json() as Partial<MockTeam>;
    const target = teams.find((t) => t.id === Number(params.teamId));
    if (!target) {
      return fail('팀을 찾을 수 없습니다.', { status: 404 });
    }
    Object.assign(target, body, { id: target.id });
    return ok(toResponse(target), '팀 수정 성공');
  }),

  // 삭제
  http.delete(`${BASE_URL}/teams/:teamId`, ({ params }) => {
    teams = teams.filter((t) => t.id !== Number(params.teamId));
    return ok(null, `${params.teamId} 삭제 완료`);
  }),
];
