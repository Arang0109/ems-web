import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

export const dashboardHandlers = [
  http.get(`${BASE_URL}/dashboard/measurement-stats`, () => {
    return HttpResponse.json({
      status: true,
      message: '측정건수 통계 조회 성공',
      data: {
        monthly: [
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
          { label: '12월', count: 143 },
        ],
        weekly: [
          { label: '1주', count: 48 },
          { label: '2주', count: 62 },
          { label: '3주', count: 55 },
          { label: '4주', count: 71 },
          { label: '5주', count: 43 },
          { label: '6주', count: 58 },
          { label: '7주', count: 67 },
          { label: '8주', count: 52 },
        ],
        daily: [
          { label: '월', count: 23 },
          { label: '화', count: 31 },
          { label: '수', count: 18 },
          { label: '목', count: 27 },
          { label: '금', count: 35 },
          { label: '토', count: 12 },
          { label: '일', count: 8 },
        ],
      },
    });
  }),

  http.get(`${BASE_URL}/dashboard/summary`, () => {
    return HttpResponse.json({
      status: true,
      message: '대시보드 요약 조회 성공',
      data: {
        workplaceCount: 48,
        facilityCount: 213,
        totalMeasurements: 2417,
        thisMonthMeasurements: 187,
        workplacesByRegion: [
          { region: '서울', count: 12 },
          { region: '경기', count: 15 },
          { region: '인천', count: 6 },
          { region: '부산', count: 7 },
          { region: '대구', count: 4 },
          { region: '기타', count: 4 },
        ],
        facilitiesByType: [
          { type: '대기', count: 87 },
          { type: '수질', count: 64 },
          { type: '소음', count: 38 },
          { type: '토양', count: 24 },
        ],
      },
    });
  }),
];
