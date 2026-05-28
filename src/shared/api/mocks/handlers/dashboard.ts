import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

export const dashboardHandlers = [
  http.get(`${BASE_URL}/dashboard/measurement-stats`, () => {
    return HttpResponse.json({
      status: true,
      message: '측정건수 통계 조회 성공',
      data: [
        { label: '1월', count: 142 },
        { label: '2월', count: 98 },
        { label: '3월', count: 175 },
        { label: '4월', count: 203 },
        { label: '5월', count: 187 },
        { label: '6월', count: 221 },
        { label: '7월', count: 264 },
        { label: '8월', count: 198 },
        { label: '9월', count: 231 },
        { label: '10월', count: 189 },
        { label: '11월', count: 167 },
        { label: '12월', count: 143 }
      ],
    });
  }),

  http.get(`${BASE_URL}/dashboard/summary`, () => {
    return HttpResponse.json({
      status: true,
      message: '대시보드 요약 조회 성공',
      data: {
        workplaceCount: 48,
        stackCount: 213,
        totalMeasurements: 2417,
        thisMonthMeasurements: 187,
      },
    });
  }),
];
