import { http, HttpResponse } from 'msw';
import type { MeasurementField, MeasurementMethod, PollutantPhase } from '@shared/model';

const BASE_URL = 'http://localhost:8080/api';

type PollutantRow = {
  id: number;
  field: MeasurementField;
  nameKr: string;
  nameEn: string;
  method: MeasurementMethod;
  phase: PollutantPhase;
  equipment: string;
  testMethod: string;
};

// 수정·삭제 결과가 목록에 반영되도록 모듈 스코프 store 로 둔다(새로고침하면 초기화).
const pollutants: PollutantRow[] = [
  { id: 1,  field: 'AIR',             nameKr: '먼지',                   nameEn: 'Dust',                         method: 'DUST',                phase: 'PARTICLE', equipment: '등속흡인장치',    testMethod: 'ES 01301.2' },
  { id: 2,  field: 'AIR',             nameKr: '황산화물',               nameEn: 'Sulfur Oxides',                method: 'FIELD_MEASUREMENT',   phase: 'GAS',      equipment: '자동가스분석기',  testMethod: 'ES 01301.1' },
  { id: 3,  field: 'AIR',             nameKr: '질소산화물',             nameEn: 'Nitrogen Oxides',              method: 'FIELD_MEASUREMENT',   phase: 'GAS',      equipment: '자동가스분석기',  testMethod: 'ES 01303.1' },
  { id: 4,  field: 'AIR',             nameKr: '염화수소',               nameEn: 'Hydrogen Chloride',            method: 'ABSORPTION_SOLUTION', phase: 'GAS',      equipment: '흡수병',          testMethod: 'ES 01401.1' },
  { id: 5,  field: 'AIR',             nameKr: '일산화탄소',             nameEn: 'Carbon Monoxide',              method: 'FIELD_MEASUREMENT',   phase: 'GAS',      equipment: '자동가스분석기',  testMethod: 'ES 01302.1' },
  { id: 6,  field: 'WATER',           nameKr: '생물화학적산소요구량',   nameEn: 'Biochemical Oxygen Demand',    method: 'FIELD_MEASUREMENT',   phase: 'GAS',      equipment: 'BOD 측정기',      testMethod: 'ES 04305.1' },
  { id: 7,  field: 'WATER',           nameKr: '화학적산소요구량',       nameEn: 'Chemical Oxygen Demand',       method: 'FIELD_MEASUREMENT',   phase: 'GAS',      equipment: 'COD 측정기',      testMethod: 'ES 04306.1' },
  { id: 8,  field: 'WATER',           nameKr: '부유물질',               nameEn: 'Suspended Solids',             method: 'FIELD_MEASUREMENT',   phase: 'PARTICLE', equipment: '여과장치',         testMethod: 'ES 04303.1' },
  { id: 9,  field: 'WATER',           nameKr: '총질소',                 nameEn: 'Total Nitrogen',               method: 'FIELD_MEASUREMENT',   phase: 'GAS',      equipment: '총질소 측정기',   testMethod: 'ES 04363.1' },
  { id: 10, field: 'NOISE_VIBRATION', nameKr: '소음',                   nameEn: 'Noise Level',                  method: 'FIELD_MEASUREMENT',   phase: 'GAS',      equipment: '소음측정기',      testMethod: 'ES 03301.1' },
  { id: 11, field: 'ODOR',            nameKr: '암모니아',               nameEn: 'Ammonia',                      method: 'ABSORPTION_SOLUTION', phase: 'GAS',      equipment: '흡수병',          testMethod: 'ES 09301.1' },
];

export const pollutantHandlers = [
  http.get(`${BASE_URL}/pollutants`, () => {
    return HttpResponse.json({
      status: true,
      message: '오염물질 목록 조회 성공',
      data: pollutants,
    });
  }),

  http.post(`${BASE_URL}/pollutants`, async ({ request }) => {
    const body = await request.json() as Omit<PollutantRow, 'id'>;
    const created: PollutantRow = { id: Date.now(), ...body };
    pollutants.push(created);
    return HttpResponse.json({
      status: true,
      message: '오염물질 등록 성공',
      data: created,
    }, { status: 201 });
  }),

  http.put(`${BASE_URL}/pollutants/:pollutantId`, async ({ params, request }) => {
    const id = Number(params.pollutantId);
    const index = pollutants.findIndex((p) => p.id === id);
    if (index < 0) {
      return HttpResponse.json(
        { status: false, message: '측정물질을 찾을 수 없습니다.', data: null },
        { status: 404 },
      );
    }

    // 서버는 전달되지 않았거나 빈 문자열인 필드를 기존 값으로 유지한다.
    const body = await request.json() as Partial<Omit<PollutantRow, 'id'>>;
    const updated = { ...pollutants[index] };
    for (const [key, value] of Object.entries(body)) {
      if (value === null || value === undefined || value === '') continue;
      Object.assign(updated, { [key]: value });
    }
    pollutants[index] = updated;

    return HttpResponse.json({
      status: true,
      message: '오염물질 수정 성공',
      data: updated,
    });
  }),

  http.delete(`${BASE_URL}/pollutants/:pollutantId`, ({ params }) => {
    const id = Number(params.pollutantId);
    const index = pollutants.findIndex((p) => p.id === id);
    if (index < 0) {
      return HttpResponse.json(
        { status: false, message: '측정물질을 찾을 수 없습니다.', data: null },
        { status: 404 },
      );
    }
    pollutants.splice(index, 1);

    return HttpResponse.json({
      status: true,
      message: '오염물질 삭제 성공',
      data: null,
    });
  }),
];
