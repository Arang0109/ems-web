import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

export const pollutantHandlers = [
  http.get(`${BASE_URL}/pollutants`, () => {
    return HttpResponse.json({
      status: true,
      message: '오염물질 목록 조회 성공',
      data: [
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
      ],
    });
  }),

  http.post(`${BASE_URL}/pollutants`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      status: true,
      message: '오염물질 등록 성공',
      data: { id: Date.now(), ...body },
    }, { status: 201 });
  }),
];
