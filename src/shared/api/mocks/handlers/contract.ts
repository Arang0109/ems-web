import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

export const contractHandlers = [
  http.get(`${BASE_URL}/contracts`, () => {
    return HttpResponse.json({
      status: true,
      message: '계약 목록 조회 성공',
      data: [
        {
          id: 1,
          workplaceId: 101,
          fields: 'AIR,WATER',
          clientName: '(주)한국환경기술',
          workplaceName: '(주)한국환경기술 서울본사',
          contractName: '대기오염물질 측정대행 용역',
          taskPeriod: '173',
          contractStatus: 'active',
          contractDate: '2025-01-01',
        },
        {
          id: 2,
          workplaceId: 106,
          fields: 'WATER',
          clientName: '동아화학공업',
          workplaceName: '동아화학공업 부산본사',
          contractName: '수질오염물질 측정대행 용역',
          taskPeriod: '180',
          contractStatus: 'expiringSoon',
          contractDate: '2025-03-01',
        },
        {
          id: 3,
          workplaceId: 112,
          fields: 'NOISE_VIBRATION',
          clientName: '삼진제조(주)',
          workplaceName: '삼진제조(주) 구미공장',
          contractName: '소음·진동 측정대행 용역',
          taskPeriod: '173',
          contractStatus: 'expired',
          contractDate: '2024-06-01',
        },
        {
          id: 4,
          workplaceId: 110,
          fields: 'ODOR',
          clientName: '(주)그린에너지',
          workplaceName: '(주)그린에너지 세종사업장',
          contractName: '악취 측정대행 용역',
          taskPeriod: '121',
          contractStatus: 'active',
          contractDate: '2025-04-01',
        },
        {
          id: 5,
          workplaceId: 128,
          fields: 'AIR',
          clientName: '현대에너지(주)',
          workplaceName: '현대에너지(주) 여수사업장',
          contractName: '굴뚝 자동측정기기 측정대행 용역',
          taskPeriod: '13',
          contractStatus: 'expiringSoon',
          contractDate: '2025-01-15',
        },
        {
          id: 6,
          workplaceId: 120,
          fields: 'WATER',
          clientName: '세진중공업(주)',
          workplaceName: '세진중공업(주) 거제조선소',
          contractName: '폐수 수질 측정대행 용역',
          taskPeriod: '45',
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

  http.put(`${BASE_URL}/contracts/:contractId`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      status: true,
      message: '계약서 수정 성공',
      data: { id: Number(params.contractId), ...body }
    });
  }),

  http.delete(`${BASE_URL}/contracts/:contractId`, ({ params }) => {
    return HttpResponse.json({
      status: true,
      message: `${params.contractId} 계약서 삭제 완료`,
      data: null,
    });
  }),

  http.get(`${BASE_URL}/contracts/:contractId`, ({ params }) => {
    return HttpResponse.json({
      status: true,
      message: '계약서 조회 성공',
      data: {
        id: Number(params.contractId),
        workplaceId: 101,
        clientName: '(주)한국환경기술',
        workplaceName: '(주)한국환경기술 서울본사',
        workplaceAddress: '서울특별시 강남구 테헤란로 123',
        contractName: '대기오염물질 측정대행 용역',
        contractDate: '2025-01-01',
        startDate: '2025-01-01',
        completionDate: '2025-12-31',
        contractAmount: 12000000,
        contractAmountUnit: 'ANNUAL',
        vatIncluded: true,
        contractGuaranteeAmount: 1200000,
        advancePaymentAmount: 3000000,
        advancePaymentDueDate: 30,
        delayPenaltyRate: 0.1,
        remark: '',
      }
    });
  }),
];
