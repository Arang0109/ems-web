import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

export const pollutantHandlers = [
  http.get(`${BASE_URL}/pollutants`, () => {
    return HttpResponse.json({
      status: true,
      message: '측정건수 통계 조회 성공',
      data: [
        {
          id: 1,
          field: "AIR",
          nameKr: "황산화물",
          nameEn: "Sulfur Oxides",
          method: "FIELD_MEASUREMENT",
          phase: "GAS",
          equipment: "자동가스분석기",
          testMethod: "ES 01301.1"
        },
        {
          id: 2,
          field: "AIR",
          nameKr: "질소산화물",
          nameEn: "Nitrogen Oxides",
          method: "FIELD_MEASUREMENT",
          phase: "GAS",
          equipment: "자동가스분석기",
          testMethod: "ES 01303.1"
        },
        {
          id: 3,
          field: "AIR",
          nameKr: "먼지",
          nameEn: "Particulate Matter",
          method: "DUST",
          phase: "PARTICLE",
          equipment: "등속흡인장치",
          testMethod: "ES 01301.2"
        },
        {
          id: 4,
          field: "ODOR",
          nameKr: "암모니아",
          nameEn: "Ammonia",
          method: "ABSORPTION_SOLUTION",
          phase: "GAS",
          equipment: "흡수병",
          testMethod: "ES 09301.1"
        },
      ]
    });
  }),
];
