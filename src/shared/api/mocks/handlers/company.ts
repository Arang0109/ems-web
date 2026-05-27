import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

export const companyHandlers = [
  http.get(`${BASE_URL}/companies`, () => {
    return HttpResponse.json({
      status: true,
      message: '거래처 목록 조회 성공',
      data: [
        {
          id: 1,
          name: '(주)한국환경기술',
          businessNumber: '123-45-67890',
          representative: '김철수',
          phone: '02-1234-5678',
          address: '서울특별시 강남구 테헤란로 123',
          registeredAt: '2022-03-15',
          status: 'active',
        },
        {
          id: 2,
          name: '대성산업(주)',
          businessNumber: '234-56-78901',
          representative: '이영희',
          phone: '031-234-5678',
          address: '경기도 수원시 영통구 월드컵로 206',
          registeredAt: '2022-07-22',
          status: 'active',
        },
        {
          id: 3,
          name: '동아화학공업',
          businessNumber: '345-67-89012',
          representative: '박민준',
          phone: '051-345-6789',
          address: '부산광역시 사하구 하신중앙로 99',
          registeredAt: '2023-01-10',
          status: 'inactive',
        },
        {
          id: 4,
          name: '(주)그린에너지',
          businessNumber: '456-78-90123',
          representative: '최지수',
          phone: '042-456-7890',
          address: '대전광역시 유성구 대덕대로 512',
          registeredAt: '2023-04-05',
          status: 'active',
        },
        {
          id: 5,
          name: '삼진제조(주)',
          businessNumber: '567-89-01234',
          representative: '정우성',
          phone: '053-567-8901',
          address: '대구광역시 달서구 성서산업로 100',
          registeredAt: '2023-06-18',
          status: 'active',
        },
        {
          id: 6,
          name: '한빛소재산업',
          businessNumber: '678-90-12345',
          representative: '강수진',
          phone: '062-678-9012',
          address: '광주광역시 광산구 하남산단 6번로 107',
          registeredAt: '2023-09-30',
          status: 'inactive',
        },
        {
          id: 7,
          name: '(주)미래환경',
          businessNumber: '789-01-23456',
          representative: '윤재원',
          phone: '032-789-0123',
          address: '인천광역시 남동구 남동공단로 215',
          registeredAt: '2024-02-14',
          status: 'active',
        },
        {
          id: 8,
          name: '세진중공업(주)',
          businessNumber: '890-12-34567',
          representative: '임동현',
          phone: '055-890-1234',
          address: '경상남도 창원시 성산구 공단로 730',
          registeredAt: '2024-05-20',
          status: 'active',
        },
      ],
    });
  }),
];
