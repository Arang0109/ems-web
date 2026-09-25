import { http } from 'msw';

import { BASE_URL, ok, fail } from '../utils';

type MockTenant = {
  tenantId: number;
  name: string;
  bizNumber: string;
  status: string;             // ACTIVE | SUSPENDED | INACTIVE | PENDING
  subscriptionPlan: string;   // BASIC | PRO | ENTERPRISE | INTERNAL
  createdAt: string;
  modifiedAt: string;
};

// enum 값 다양성 확보 (status·subscriptionPlan)
export const tenantList: MockTenant[] = [
  { tenantId: 1, name: '엔솔루션',   bizNumber: '2208765432', status: 'ACTIVE',    subscriptionPlan: 'ENTERPRISE', createdAt: '2025-01-02T09:00:00', modifiedAt: '2025-01-02T09:00:00' },
  { tenantId: 2, name: '그린테크',   bizNumber: '1138600001', status: 'ACTIVE',    subscriptionPlan: 'PRO',        createdAt: '2025-02-11T09:00:00', modifiedAt: '2025-02-11T09:00:00' },
  { tenantId: 3, name: '블루환경',   bizNumber: '3145600002', status: 'SUSPENDED', subscriptionPlan: 'BASIC',      createdAt: '2025-03-05T09:00:00', modifiedAt: '2025-06-05T09:00:00' },
  { tenantId: 4, name: '한빛이엔지', bizNumber: '5098700003', status: 'PENDING',   subscriptionPlan: 'PRO',        createdAt: '2025-04-18T09:00:00', modifiedAt: '2025-04-18T09:00:00' },
];

export const tenantHandlers = [
  // 경로 구체성: /platform/tenants/:id를 /platform/tenants보다 먼저 등록
  http.get(`${BASE_URL}/platform/tenants/:tenantId`, ({ params }) => {
    const tenant = tenantList.find((t) => t.tenantId === Number(params.tenantId));
    if (!tenant) {
      return fail('고객사를 찾을 수 없습니다.', { status: 404 });
    }
    return ok(tenant, '고객사 조회 성공');
  }),

  http.get(`${BASE_URL}/platform/tenants`, () => {
    return ok(tenantList, '고객사 목록 조회 성공');
  }),

  http.post(`${BASE_URL}/platform/tenants`, async ({ request }) => {
    const body = await request.json() as {
      name: string;
      bizNumber: string;
      subscriptionPlan: string;
      admin: {
        username: string; password: string; name: string;
        department: string; email: string; tel: string;
      };
    };
    return ok({
        tenantId: Date.now(),
        name: body.name,
        bizNumber: body.bizNumber,
        status: 'ACTIVE',
        subscriptionPlan: body.subscriptionPlan,
        createdAt: '2026-07-17T09:00:00',
        modifiedAt: '2026-07-17T09:00:00',
      }, '고객사 발급 성공', { status: 201 });
  }),
];
