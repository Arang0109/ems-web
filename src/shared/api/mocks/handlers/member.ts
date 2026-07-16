import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

const TENANT_ID = 1;

// roles 테이블 시드와 동일한 규격 (roleId, name, description)
const roleList = [
  { roleId: 1, name: 'ADMIN', description: '관리자' },
  { roleId: 2, name: 'LAB', description: '분석실' },
  { roleId: 3, name: 'FIELD', description: '측정팀' },
  { roleId: 4, name: 'DOC', description: '문서담당' },
  { roleId: 5, name: 'USER', description: '일반 사용자' },
];

const roleName = (roleId: number) => roleList.find((r) => r.roleId === roleId)?.name ?? 'USER';

type MockMember = {
  id: number;
  username: string;
  name: string;
  roleId: number;
  role: string;
  department: string;
  email: string;
  tel: string;
  tenantId: number;
  createdAt: string;
  modifiedAt: string;
};

export const memberList: MockMember[] = [
  { id: 1, username: 'admin',    name: '김관리', roleId: 1, role: 'ADMIN', department: '경영지원팀', email: 'admin@ensol.com',   tel: '01011112222', tenantId: TENANT_ID, createdAt: '2025-01-02T09:00:00', modifiedAt: '2025-01-02T09:00:00' },
  { id: 2, username: 'lab.kim',  name: '이분석', roleId: 2, role: 'LAB',   department: '분석실',     email: 'lab.kim@ensol.com', tel: '01033334444', tenantId: TENANT_ID, createdAt: '2025-02-11T09:00:00', modifiedAt: '2025-02-11T09:00:00' },
  { id: 3, username: 'field.oh', name: '박측정', roleId: 3, role: 'FIELD', department: '측정1팀',    email: 'field.oh@ensol.com', tel: '01055556666', tenantId: TENANT_ID, createdAt: '2025-03-05T09:00:00', modifiedAt: '2025-03-05T09:00:00' },
  { id: 4, username: 'doc.seo',  name: '최문서', roleId: 4, role: 'DOC',   department: '품질관리팀', email: 'doc.seo@ensol.com',  tel: '01077778888', tenantId: TENANT_ID, createdAt: '2025-04-18T09:00:00', modifiedAt: '2025-04-18T09:00:00' },
  { id: 5, username: 'user.han', name: '한사원', roleId: 5, role: 'USER',  department: '측정2팀',    email: 'user.han@ensol.com', tel: '01099990000', tenantId: TENANT_ID, createdAt: '2025-05-22T09:00:00', modifiedAt: '2025-05-22T09:00:00' },
];

export const roleHandlers = [
  http.get(`${BASE_URL}/roles`, () => {
    return HttpResponse.json({
      status: true,
      message: '역할 목록 조회 성공',
      data: roleList,
    });
  }),
];

export const memberHandlers = [
  // 경로 구체성: /admin/members/:id를 /admin/members보다 먼저 등록
  http.get(`${BASE_URL}/admin/members/:memberId`, ({ params }) => {
    const member = memberList.find((m) => m.id === Number(params.memberId));
    if (!member) {
      return HttpResponse.json({ status: false, message: '회원을 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    return HttpResponse.json({ status: true, message: '회원 조회 성공', data: member });
  }),

  http.get(`${BASE_URL}/admin/members`, () => {
    return HttpResponse.json({
      status: true,
      message: '회원 목록 조회 성공',
      data: memberList,
    });
  }),

  http.post(`${BASE_URL}/admin/members`, async ({ request }) => {
    const body = await request.json() as {
      roleId: number; username: string; name: string;
      department: string; email: string; tel: string;
    };
    return HttpResponse.json({
      status: true,
      message: '회원 등록 성공',
      data: {
        id: Date.now(),
        username: body.username,
        name: body.name,
        roleId: body.roleId,
        role: roleName(body.roleId),
        department: body.department,
        email: body.email,
        tel: body.tel,
        tenantId: TENANT_ID,
        createdAt: '2026-07-13T09:00:00',
        modifiedAt: '2026-07-13T09:00:00',
      },
    }, { status: 201 });
  }),

  http.put(`${BASE_URL}/admin/members/:memberId`, async ({ params, request }) => {
    const body = await request.json() as {
      roleId: number; name: string; department: string; email: string; tel: string;
    };
    return HttpResponse.json({
      status: true,
      message: '회원 수정 성공',
      data: {
        id: Number(params.memberId),
        ...body,
        role: roleName(body.roleId),
        tenantId: TENANT_ID,
      },
    });
  }),

  http.delete(`${BASE_URL}/admin/members/:memberId`, ({ params }) => {
    return HttpResponse.json({
      status: true,
      message: `${params.memberId} 삭제 완료`,
      data: null,
    });
  }),
];
