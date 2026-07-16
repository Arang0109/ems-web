import { http, HttpResponse } from 'msw';
import type { MeasurementCycle } from '@shared/model';

const BASE_URL = 'http://localhost:8080/api';

type StackPollutantRow = {
  id: number;
  stackId: number;
  pollutantId: number;
  nameKr: string;
  nameEn: string;
  cycle: MeasurementCycle;
  allowance: string;
};

const measurementsByStack: Record<number, StackPollutantRow[]> = {
  1001: [
    { id: 1, stackId: 1001, pollutantId: 1, nameKr: '먼지',        nameEn: 'Dust',             cycle: 'MONTHLY',     allowance: '30 mg/Sm³' },
    { id: 2, stackId: 1001, pollutantId: 2, nameKr: '황산화물',    nameEn: 'SOx',              cycle: 'QUARTERLY',   allowance: '180 ppm' },
    { id: 3, stackId: 1001, pollutantId: 3, nameKr: '질소산화물',  nameEn: 'NOx',              cycle: 'QUARTERLY',   allowance: '150 ppm' },
    { id: 4, stackId: 1001, pollutantId: 4, nameKr: '염화수소',    nameEn: 'HCl',              cycle: 'SEMI_ANNUAL', allowance: '10 ppm' },
  ],
  1002: [
    { id: 5, stackId: 1002, pollutantId: 1, nameKr: '먼지',        nameEn: 'Dust',             cycle: 'MONTHLY',     allowance: '30 mg/Sm³' },
    { id: 6, stackId: 1002, pollutantId: 5, nameKr: '일산화탄소',  nameEn: 'CO',               cycle: 'QUARTERLY',   allowance: '200 ppm' },
  ],
  1008: [
    { id: 7, stackId: 1008, pollutantId: 6, nameKr: '생물화학적산소요구량', nameEn: 'BOD',    cycle: 'MONTHLY',     allowance: '30 mg/L' },
    { id: 8, stackId: 1008, pollutantId: 7, nameKr: '화학적산소요구량',     nameEn: 'COD',    cycle: 'MONTHLY',     allowance: '40 mg/L' },
    { id: 9, stackId: 1008, pollutantId: 8, nameKr: '부유물질',             nameEn: 'SS',     cycle: 'TWICE_MONTHLY', allowance: '30 mg/L' },
    { id: 10, stackId: 1008, pollutantId: 9, nameKr: '총질소',              nameEn: 'T-N',    cycle: 'QUARTERLY',   allowance: '60 mg/L' },
  ],
  1019: [
    { id: 11, stackId: 1019, pollutantId: 10, nameKr: '소음', nameEn: 'Noise Level', cycle: 'BIMONTHLY', allowance: '60 dB(A)' },
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
];
