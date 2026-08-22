import { http, HttpResponse } from 'msw';
import type { MeasurementCycle } from '@shared/model';

const BASE_URL = 'http://localhost:8080/api';

type StackPollutantRow = {
  id: number;
  stackId: number;
  pollutantId: number;
  /** 가이드 투영값이라 항상 채워진다 */
  code: string;
  nameKr: string;
  nameEn: string;
  cycle: MeasurementCycle;
  allowance: string;
  oxygenApplicable: boolean;
};

const measurementsByStack: Record<number, StackPollutantRow[]> = {
  // 측정계획 상세(schedule 핸들러 stackId: 1)의 측정항목 카드용.
  // 스냅샷 items(먼지·질소산화물)를 포함해 "현재 측정 항목 / 나머지" 분기를 모두 태운다.
  1: [
    { id: 101, stackId: 1, pollutantId: 1, code: 'TSP', nameKr: '먼지',       nameEn: 'Dust', cycle: 'QUARTERLY', allowance: '30 mg/Sm³', oxygenApplicable: true },
    { id: 102, stackId: 1, pollutantId: 2, code: 'NOX', nameKr: '질소산화물', nameEn: 'NOx',  cycle: 'QUARTERLY', allowance: '150 ppm', oxygenApplicable: true },
    { id: 103, stackId: 1, pollutantId: 3, code: 'SOX', nameKr: '황산화물',   nameEn: 'SOx',  cycle: 'QUARTERLY', allowance: '180 ppm', oxygenApplicable: true },
    { id: 104, stackId: 1, pollutantId: 4, code: 'HCL', nameKr: '염화수소',   nameEn: 'HCl',  cycle: 'MONTHLY',   allowance: '10 ppm', oxygenApplicable: false },
    { id: 105, stackId: 1, pollutantId: 5, code: 'CO', nameKr: '일산화탄소', nameEn: 'CO',   cycle: 'MONTHLY',   allowance: '200 ppm', oxygenApplicable: false },
    { id: 106, stackId: 1, pollutantId: 11, code: 'NH3', nameKr: '암모니아',  nameEn: 'NH3',  cycle: 'ANNUAL',    allowance: '30 ppm', oxygenApplicable: false },
  ],
  1001: [
    { id: 1, stackId: 1001, pollutantId: 1, code: 'TSP', nameKr: '먼지',        nameEn: 'Dust',             cycle: 'MONTHLY',     allowance: '30 mg/Sm³', oxygenApplicable: true },
    { id: 2, stackId: 1001, pollutantId: 2, code: 'SOX', nameKr: '황산화물',    nameEn: 'SOx',              cycle: 'QUARTERLY',   allowance: '180 ppm', oxygenApplicable: true },
    { id: 3, stackId: 1001, pollutantId: 3, code: 'NOX', nameKr: '질소산화물',  nameEn: 'NOx',              cycle: 'QUARTERLY',   allowance: '150 ppm', oxygenApplicable: true },
    { id: 4, stackId: 1001, pollutantId: 4, code: 'HCL', nameKr: '염화수소',    nameEn: 'HCl',              cycle: 'SEMI_ANNUAL', allowance: '10 ppm', oxygenApplicable: false },
  ],
  1002: [
    { id: 5, stackId: 1002, pollutantId: 1, code: 'TSP', nameKr: '먼지',        nameEn: 'Dust',             cycle: 'MONTHLY',     allowance: '30 mg/Sm³', oxygenApplicable: true },
    { id: 6, stackId: 1002, pollutantId: 5, code: 'CO', nameKr: '일산화탄소',  nameEn: 'CO',               cycle: 'QUARTERLY',   allowance: '200 ppm', oxygenApplicable: false },
  ],
  // 수질·소음 시설은 기준산소농도가 없어 oxygenApplicable 이 항상 false 다.
  1008: [
    { id: 7, stackId: 1008, pollutantId: 6, code: 'BOD', nameKr: '생물화학적산소요구량', nameEn: 'BOD',    cycle: 'MONTHLY',     allowance: '30 mg/L', oxygenApplicable: false },
    { id: 8, stackId: 1008, pollutantId: 7, code: 'COD', nameKr: '화학적산소요구량',     nameEn: 'COD',    cycle: 'MONTHLY',     allowance: '40 mg/L', oxygenApplicable: false },
    { id: 9, stackId: 1008, pollutantId: 8, code: 'SS', nameKr: '부유물질',             nameEn: 'SS',     cycle: 'TWICE_MONTHLY', allowance: '30 mg/L', oxygenApplicable: false },
    { id: 10, stackId: 1008, pollutantId: 9, code: 'TN', nameKr: '총질소',               nameEn: 'T-N',    cycle: 'QUARTERLY',   allowance: '60 mg/L', oxygenApplicable: false },
  ],
  1019: [
    { id: 11, stackId: 1019, pollutantId: 10, code: 'NOISE', nameKr: '소음', nameEn: 'Noise Level', cycle: 'BIMONTHLY', allowance: '60 dB(A)', oxygenApplicable: false },
  ],
};

export const stackPollutantHandlers = [
  http.get(`${BASE_URL}/stack-pollutants`, ({ request }) => {
    const url = new URL(request.url);
    const stackIdParam = url.searchParams.get('stackId');
    const measurements = stackIdParam
      ? (measurementsByStack[Number(stackIdParam)] ?? [])
      : Object.values(measurementsByStack).flat();
    return HttpResponse.json({
      status: true,
      message: '측정항목 목록 조회 성공',
      data: measurements,
    });
  }),

  http.post(`${BASE_URL}/stack-pollutants/batch`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>[];
    const data = body.map((item, i) => ({ id: Date.now() + i, ...item }));
    return HttpResponse.json({
      status: true,
      message: '측정항목 일괄 등록 성공',
      data,
    }, { status: 201 });
  }),

  http.post(`${BASE_URL}/stack-pollutants`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      status: true,
      message: '측정항목 등록 성공',
      data: { id: Date.now(), ...body },
    }, { status: 201 });
  }),

  /*
   * 수정·삭제는 등록과 달리 메모리 상태를 실제로 고친다.
   * 화면이 성공 직후 목록을 다시 읽으므로, 응답만 흉내 내면 토스트와 표가 어긋나 보인다.
   */
  http.put(`${BASE_URL}/stack-pollutants/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = await request.json() as Pick<StackPollutantRow, 'cycle' | 'oxygenApplicable'> & { allowance: number | null };
    const row = Object.values(measurementsByStack).flat().find((item) => item.id === id);

    if (!row) {
      return HttpResponse.json({ status: false, message: '측정항목을 찾을 수 없습니다.' }, { status: 404 });
    }

    row.cycle = body.cycle;
    row.allowance = body.allowance === null ? '' : String(body.allowance);
    row.oxygenApplicable = body.oxygenApplicable;

    return HttpResponse.json({
      status: true,
      message: '측정항목 수정 성공',
      data: { id: row.id, stackId: row.stackId, pollutantId: row.pollutantId, cycle: row.cycle, allowance: row.allowance, oxygenApplicable: row.oxygenApplicable },
    });
  }),

  http.delete(`${BASE_URL}/stack-pollutants/:id`, ({ params }) => {
    const id = Number(params.id);
    const rows = Object.values(measurementsByStack).find((list) => list.some((item) => item.id === id));

    if (!rows) {
      return HttpResponse.json({ status: false, message: '측정항목을 찾을 수 없습니다.' }, { status: 404 });
    }

    rows.splice(rows.findIndex((item) => item.id === id), 1);

    return HttpResponse.json({ status: true, message: '측정항목 삭제 성공', data: null });
  }),
];
