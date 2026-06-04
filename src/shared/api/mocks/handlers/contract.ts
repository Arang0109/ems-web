import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

export const contractHandlers = [
  http.get(`${BASE_URL}/contracts`, () => {
    return HttpResponse.json({
      status: true,
      message: '계약 목록 조회 성공',
      data: [
        {
          field: 'air',
          companyName: '(주)한국환경기술',
          workplaceName: '(주)한국환경기술 서울본사',
          contractName: '대기오염물질 측정대행 용역',
          taskPeriod: '2025-01-01 ~ 2025-12-31',
          contractStatus: 'active',
          contractDate: '2025-01-01',
        },
        {
          field: 'water',
          companyName: '동아화학공업',
          workplaceName: '동아화학공업 부산본사',
          contractName: '수질오염물질 측정대행 용역',
          taskPeriod: '2025-03-01 ~ 2025-08-31',
          contractStatus: 'expiringSoon',
          contractDate: '2025-03-01',
        },
        {
          field: 'noiseVibration',
          companyName: '삼진제조(주)',
          workplaceName: '삼진제조(주) 구미공장',
          contractName: '소음·진동 측정대행 용역',
          taskPeriod: '2024-06-01 ~ 2025-05-31',
          contractStatus: 'expired',
          contractDate: '2024-06-01',
        },
        {
          field: 'odor',
          companyName: '(주)그린에너지',
          workplaceName: '(주)그린에너지 세종사업장',
          contractName: '악취 측정대행 용역',
          taskPeriod: '2025-04-01 ~ 2026-03-31',
          contractStatus: 'active',
          contractDate: '2025-04-01',
        },
        {
          field: 'air',
          companyName: '현대에너지(주)',
          workplaceName: '현대에너지(주) 여수사업장',
          contractName: '굴뚝 자동측정기기 측정대행 용역',
          taskPeriod: '2025-01-15 ~ 2025-07-14',
          contractStatus: 'expiringSoon',
          contractDate: '2025-01-15',
        },
        {
          field: 'water',
          companyName: '세진중공업(주)',
          workplaceName: '세진중공업(주) 거제조선소',
          contractName: '폐수 수질 측정대행 용역',
          taskPeriod: '2025-02-01 ~ 2026-01-31',
          contractStatus: 'active',
          contractDate: '2025-02-01',
        },
      ],
    });
  }),
  
  http.post(`${BASE_URL}/contracts`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      status: true,
      message: '계약서 등록 성공',
      data: { id: Date.now(), ...body }
    }, { status: 201 });
  }),
];
