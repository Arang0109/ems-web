import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

export const workplaceHandlers = [
  http.get(`${BASE_URL}/workplaces/summary`, () => {
    return HttpResponse.json({
      status: true,
      message: '거래처 목록 조회 성공',
      data: [
        { id: 1,  companyName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 서울사무소', address: '서울특별시 강남구 테헤란로 123', createdAt: '2022-03-15', status: 'active' },
        { id: 2,  companyName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 부산지사',   address: '부산광역시 해운대구 센텀중앙로 90', createdAt: '2022-05-10', status: 'active' },
        { id: 3,  companyName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 대전지사',   address: '대전광역시 유성구 대덕대로 512', createdAt: '2022-09-01', status: 'active' },
        { id: 4,  companyName: '대성산업(주)',      workplaceName: '대성산업(주) 수원공장',       address: '경기도 수원시 영통구 월드컵로 206',   createdAt: '2022-07-22', status: 'expiringSoon' },
        { id: 5,  companyName: '대성산업(주)',      workplaceName: '대성산업(주) 안양지사',       address: '경기도 안양시 동안구 시민대로 327',  createdAt: '2022-11-03', status: 'expiringSoon' },
        { id: 6,  companyName: '동아화학공업',      workplaceName: '동아화학공업 사하본사',       address: '부산광역시 사하구 하신중앙로 99',     createdAt: '2023-01-10', status: 'expired' },
        { id: 7,  companyName: '동아화학공업',      workplaceName: '동아화학공업 울산공장',       address: '울산광역시 울주군 온산읍 산업로 120', createdAt: '2023-03-18', status: 'expired' },
        { id: 8,  companyName: '(주)그린에너지',    workplaceName: '(주)그린에너지 대전본사',     address: '대전광역시 유성구 대덕대로 512',       createdAt: '2023-04-05', status: 'active' },
        { id: 9,  companyName: '(주)그린에너지',    workplaceName: '(주)그린에너지 세종지사',     address: '세종특별자치시 한누리대로 2130',       createdAt: '2023-06-20', status: 'active' },
        { id: 10, companyName: '삼진제조(주)',       workplaceName: '삼진제조(주) 대구본사',       address: '대구광역시 달서구 성서산업로 100',     createdAt: '2023-06-18', status: 'active' },
        { id: 11, companyName: '삼진제조(주)',       workplaceName: '삼진제조(주) 구미공장',       address: '경상북도 구미시 산호대로 180',         createdAt: '2023-08-07', status: 'active' },
        { id: 12, companyName: '한빛소재산업',       workplaceName: '한빛소재산업 광주본사',       address: '광주광역시 광산구 하남산단 6번로 107', createdAt: '2023-09-30', status: 'active' },
        { id: 13, companyName: '(주)미래환경',       workplaceName: '(주)미래환경 인천본사',       address: '인천광역시 남동구 남동공단로 215',     createdAt: '2024-02-14', status: 'active' },
        { id: 14, companyName: '(주)미래환경',       workplaceName: '(주)미래환경 시흥지사',       address: '경기도 시흥시 정왕대로 53',            createdAt: '2024-04-09', status: 'active' },
        { id: 15, companyName: '세진중공업(주)',      workplaceName: '세진중공업(주) 창원본사',     address: '경상남도 창원시 성산구 공단로 730',   createdAt: '2024-05-20', status: 'active' },
        { id: 16, companyName: '세진중공업(주)',      workplaceName: '세진중공업(주) 거제지사',     address: '경상남도 거제시 장평로 126',           createdAt: '2024-07-01', status: 'active' },
        { id: 17, companyName: '(주)태양기술',        workplaceName: '(주)태양기술 서울본사',       address: '서울특별시 마포구 월드컵북로 396',     createdAt: '2024-08-15', status: 'active' },
        { id: 18, companyName: '경남산업(주)',         workplaceName: '경남산업(주) 부산공장',       address: '부산광역시 강서구 신항대로 345',       createdAt: '2024-09-22', status: 'active' },
        { id: 19, companyName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산본사',     address: '울산광역시 남구 삼산로 100',           createdAt: '2024-10-30', status: 'active' },
        { id: 20, companyName: '(주)청정환경',         workplaceName: '(주)청정환경 수도권사무소',   address: '경기도 성남시 분당구 판교로 256',      createdAt: '2024-12-05', status: 'active' },
      ],
    });
  }),

  http.get(`${BASE_URL}/workplaces/contract-summary`, () => {
    return HttpResponse.json({
      status: true,
      message: '계약정보 요약 조회 성공',
      data: {
        recentContractCount: 3,
        totalContractCount: 20,
        expiringSoonContractCount: 2,
        expiredContractCount: 2,
      }
    })
  }),

  http.get(`${BASE_URL}/workplaces/1`, () => {
    return HttpResponse.json({
      status: true,
      message: '계약정보 요약 조회 성공',
      data: {
        company: {
          id: 1,
          name: '(주)한국환경기술',
          address: '서울특별시 강남구 테헤란로 123',
          ceoName: '강서울',
          bizNumber: '123-45312-32',
          status: 'active',
          createdAt: '2022-03-15',
          modifiedAt: '2022-03-15'
        },
        workplace: {
          id: 1,
          companyId: 1,
          name: '(주)한국환경기술 서울사무소',
          address: '서울특별시 강남구 테헤란로 123',                 // 주소
          bizNumber: '123-45312-32',               // 사업자번호 (xxx-xx-xxxxx)
          manager: '강민수',
          businessCategory: '자동차 제조업',
          grade: 'TYPE_1',
          remark: '12월 계약 종료',
          status: 'active',
          createdAt: '2022-03-15',
          modifiedAt: '2022-03-15',
        }
      }
    })
  }),
];
