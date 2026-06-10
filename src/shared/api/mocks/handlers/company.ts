import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

const workplacesByCompany: Record<number, { id: number; companyId: number; companyName: string; workplaceName: string; address: string; bizNumber: string }[]> = {
  1: [
    { id: 101, companyId: 1,  companyName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 서울본사',  address: '서울특별시 강남구 테헤란로 123',            bizNumber: '238-32482-34' },
    { id: 102, companyId: 1,  companyName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 울산공장',  address: '울산광역시 북구 산업로 300',                bizNumber: '238-32482-35' },
    { id: 103, companyId: 1,  companyName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 부산지사',  address: '부산광역시 해운대구 센텀중앙로 55',          bizNumber: '238-32482-36' },
  ],
  2: [
    { id: 104, companyId: 2,  companyName: '대성산업(주)',      workplaceName: '대성산업(주) 수원본사',       address: '경기도 수원시 영통구 월드컵로 206',          bizNumber: '401-29384-55' },
    { id: 105, companyId: 2,  companyName: '대성산업(주)',      workplaceName: '대성산업(주) 화성공장',       address: '경기도 화성시 팔탄면 서탄로 200',            bizNumber: '401-29384-56' },
  ],
  3: [
    { id: 106, companyId: 3,  companyName: '동아화학공업',      workplaceName: '동아화학공업 부산본사',       address: '부산광역시 사하구 하신중앙로 99',            bizNumber: '611-47832-43' },
    { id: 107, companyId: 3,  companyName: '동아화학공업',      workplaceName: '동아화학공업 창원공장',       address: '경상남도 창원시 의창구 팔용로 145',          bizNumber: '611-47832-44' },
    { id: 108, companyId: 3,  companyName: '동아화학공업',      workplaceName: '동아화학공업 거제사업장',     address: '경상남도 거제시 장평로 101',                bizNumber: '611-47832-45' },
  ],
  4: [
    { id: 109, companyId: 4,  companyName: '(주)그린에너지',    workplaceName: '(주)그린에너지 대전본사',     address: '대전광역시 유성구 대덕대로 512',             bizNumber: '803-72918-54' },
    { id: 110, companyId: 4,  companyName: '(주)그린에너지',    workplaceName: '(주)그린에너지 세종사업장',   address: '세종특별자치시 연기면 연기로 25',             bizNumber: '803-72918-55' },
  ],
  5: [
    { id: 111, companyId: 5,  companyName: '삼진제조(주)',       workplaceName: '삼진제조(주) 대구본사',       address: '대구광역시 달서구 성서산업로 100',           bizNumber: '104-93847-62' },
    { id: 112, companyId: 5,  companyName: '삼진제조(주)',       workplaceName: '삼진제조(주) 구미공장',       address: '경상북도 구미시 산동면 첨단기업1로 33',      bizNumber: '104-93847-63' },
    { id: 113, companyId: 5,  companyName: '삼진제조(주)',       workplaceName: '삼진제조(주) 포항사업장',     address: '경상북도 포항시 남구 오천읍 연일로 100',     bizNumber: '104-93847-64' },
  ],
  6: [
    { id: 114, companyId: 6,  companyName: '한빛소재산업',       workplaceName: '한빛소재산업 광주본사',       address: '광주광역시 광산구 하남산단 6번로 107',       bizNumber: '126-61573-28' },
    { id: 115, companyId: 6,  companyName: '한빛소재산업',       workplaceName: '한빛소재산업 나주공장',       address: '전라남도 나주시 산포면 삼영로 100',          bizNumber: '126-61573-29' },
  ],
  7: [
    { id: 116, companyId: 7,  companyName: '(주)미래환경',       workplaceName: '(주)미래환경 인천본사',       address: '인천광역시 남동구 남동공단로 215',           bizNumber: '137-43829-16' },
    { id: 117, companyId: 7,  companyName: '(주)미래환경',       workplaceName: '(주)미래환경 시흥사업장',     address: '경기도 시흥시 산기대학로 237',               bizNumber: '137-43829-17' },
    { id: 118, companyId: 7,  companyName: '(주)미래환경',       workplaceName: '(주)미래환경 안산공장',       address: '경기도 안산시 단원구 산단로 24',             bizNumber: '137-43829-18' },
  ],
  8: [
    { id: 119, companyId: 8,  companyName: '세진중공업(주)',      workplaceName: '세진중공업(주) 창원본사',     address: '경상남도 창원시 성산구 공단로 730',          bizNumber: '159-38274-61' },
    { id: 120, companyId: 8,  companyName: '세진중공업(주)',      workplaceName: '세진중공업(주) 거제조선소',   address: '경상남도 거제시 옥포1로 87',                bizNumber: '159-38274-62' },
  ],
  9: [
    { id: 121, companyId: 9,  companyName: '(주)태양기술',        workplaceName: '(주)태양기술 서울본사',       address: '서울특별시 마포구 월드컵북로 396',           bizNumber: '173-58291-34' },
    { id: 122, companyId: 9,  companyName: '(주)태양기술',        workplaceName: '(주)태양기술 용인R&D센터',    address: '경기도 용인시 기흥구 이현로 30',             bizNumber: '173-58291-35' },
  ],
  10: [
    { id: 123, companyId: 10, companyName: '경남산업(주)',         workplaceName: '경남산업(주) 부산본사',       address: '부산광역시 강서구 신항대로 345',             bizNumber: '184-73618-52' },
    { id: 124, companyId: 10, companyName: '경남산업(주)',         workplaceName: '경남산업(주) 김해공장',       address: '경상남도 김해시 주촌면 골든루트로 100',      bizNumber: '184-73618-53' },
    { id: 125, companyId: 10, companyName: '경남산업(주)',         workplaceName: '경남산업(주) 밀양사업장',     address: '경상남도 밀양시 부북면 제대로 65',           bizNumber: '184-73618-54' },
  ],
  11: [
    { id: 126, companyId: 11, companyName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산본사',     address: '울산광역시 남구 삼산로 100',                bizNumber: '195-46827-93' },
    { id: 127, companyId: 11, companyName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산공장',     address: '울산광역시 북구 진장유통로 55',              bizNumber: '195-46827-94' },
    { id: 128, companyId: 11, companyName: '현대에너지(주)',       workplaceName: '현대에너지(주) 여수사업장',   address: '전라남도 여수시 여수산단로 100',             bizNumber: '195-46827-95' },
  ],
  12: [
    { id: 129, companyId: 12, companyName: '(주)청정환경',         workplaceName: '(주)청정환경 판교본사',       address: '경기도 성남시 분당구 판교로 256',            bizNumber: '207-85136-74' },
    { id: 130, companyId: 12, companyName: '(주)청정환경',         workplaceName: '(주)청정환경 수원연구소',     address: '경기도 수원시 권선구 수인로 89',             bizNumber: '207-85136-75' },
  ],
};

const companyList = [
  { id: 1,  name: '(주)한국환경기술', bizNumber: '238-32482-34', representative: '가나다',  zipcode: '06236', roadAddress: '서울특별시 강남구 테헤란로 123',          address: '본사 1층',   manager: '김환경', email: 'kim.huan@koreaenvironment.com',  tel: '02-1234-5678' },
  { id: 2,  name: '대성산업(주)',      bizNumber: '401-29384-55', representative: '박철호',  zipcode: '16680', roadAddress: '경기도 수원시 영통구 월드컵로 206',        address: '수원본사 2층', manager: '이철수', email: 'lee.cs@daesungindustry.com',     tel: '031-456-7890' },
  { id: 3,  name: '동아화학공업',      bizNumber: '611-47832-43', representative: '정성훈',  zipcode: '49455', roadAddress: '부산광역시 사하구 하신중앙로 99',          address: '부산본사 3층', manager: '박민준', email: 'park.mj@dongachem.co.kr',        tel: '051-234-5678' },
  { id: 4,  name: '(주)그린에너지',    bizNumber: '803-72918-54', representative: '임수진',  zipcode: '34134', roadAddress: '대전광역시 유성구 대덕대로 512',           address: '대전본사 1층', manager: '최유나', email: 'choi.yn@greenenergy.co.kr',      tel: '042-345-6789' },
  { id: 5,  name: '삼진제조(주)',       bizNumber: '104-93847-62', representative: '오태현',  zipcode: '42714', roadAddress: '대구광역시 달서구 성서산업로 100',         address: '대구본사 A동', manager: '강태호', email: 'kang.th@samjinmfg.com',          tel: '053-567-8901' },
  { id: 6,  name: '한빛소재산업',       bizNumber: '126-61573-28', representative: '유준서',  zipcode: '62255', roadAddress: '광주광역시 광산구 하남산단 6번로 107',     address: '광주본사 1층', manager: '윤세진', email: 'yoon.sj@hanbitmat.co.kr',        tel: '062-678-9012' },
  { id: 7,  name: '(주)미래환경',       bizNumber: '137-43829-16', representative: '남기훈',  zipcode: '21634', roadAddress: '인천광역시 남동구 남동공단로 215',         address: '인천본사 2층', manager: '서지훈', email: 'seo.jh@miraeenv.com',            tel: '032-789-0123' },
  { id: 8,  name: '세진중공업(주)',      bizNumber: '159-38274-61', representative: '조현우',  zipcode: '51573', roadAddress: '경상남도 창원시 성산구 공단로 730',        address: '창원본사 1층', manager: '임현수', email: 'lim.hs@sejinheavy.co.kr',        tel: '055-890-1234' },
  { id: 9,  name: '(주)태양기술',        bizNumber: '173-58291-34', representative: '황성진',  zipcode: '03929', roadAddress: '서울특별시 마포구 월드컵북로 396',         address: '서울본사 5층', manager: '한가람', email: 'han.gr@taeyangtech.com',          tel: '02-901-2345' },
  { id: 10, name: '경남산업(주)',         bizNumber: '184-73618-52', representative: '홍길동',  zipcode: '46757', roadAddress: '부산광역시 강서구 신항대로 345',           address: '부산본사 2층', manager: '전도윤', email: 'jeon.dy@gyeongnam-ind.co.kr',    tel: '051-012-3456' },
  { id: 11, name: '현대에너지(주)',       bizNumber: '195-46827-93', representative: '안준혁',  zipcode: '44710', roadAddress: '울산광역시 남구 삼산로 100',               address: '울산본사 3층', manager: '오승민', email: 'oh.sm@hyundaienergy.co.kr',      tel: '052-123-4567' },
  { id: 12, name: '(주)청정환경',         bizNumber: '207-85136-74', representative: '송미경',  zipcode: '13486', roadAddress: '경기도 성남시 분당구 판교로 256',          address: '판교본사 4층', manager: '배수빈', email: 'bae.sb@cleanenv.co.kr',          tel: '031-234-5678' },
];

export const companyHandlers = [
  http.get(`${BASE_URL}/companies/:companyId`, ({ params }) => {
    const company = companyList.find(c => c.id === Number(params.companyId));
    if (!company) {
      return HttpResponse.json({ status: false, message: '의뢰기관을 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    return HttpResponse.json({ status: true, message: '의뢰기관 조회 성공', data: company });
  }),

  http.get(`${BASE_URL}/companies`, () => {
    return HttpResponse.json({
      status: true,
      message: '측정대행 의뢰기관 목록 조회 성공',
      data: companyList,
    });
  }),

  http.post(`${BASE_URL}/companies`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      status: true,
      message: '의뢰기관 등록 성공',
      data: { id: Date.now(), ...body }
    }, { status: 201 });
  }),

  http.post(`${BASE_URL}/workplaces`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      status: true,
      message: '사업장 등록 성공',
      data: { id: Date.now(), ...body }
    }, { status: 201 });
  }),

  http.get(`${BASE_URL}/workplaces/contract-summary`, () => {
    return HttpResponse.json({
      status: true,
      message: '계약 현황 요약 조회 성공',
      data: {
        recentContractCount: 6,
        totalContractCount: 18,
        expiringSoonContractCount: 3,
        expiredContractCount: 2,
      },
    });
  }),

  http.get(`${BASE_URL}/workplaces`, ({ request }) => {
    const url = new URL(request.url);
    const companyIdParam = url.searchParams.get('companyId');

    if (!companyIdParam || companyIdParam === 'null') {
      const all = Object.values(workplacesByCompany).flat();
      return HttpResponse.json({
        status: true,
        message: '측정대상 사업장 목록 조회 성공',
        data: all,
      });
    }

    const workplaces = workplacesByCompany[Number(companyIdParam)] ?? [];
    return HttpResponse.json({
      status: true,
      message: '측정대상 사업장 목록 조회 성공',
      data: workplaces,
    });
  }),

  http.delete(`${BASE_URL}/companies/:companyId`, ({ params }) => {
    return HttpResponse.json({
      status: true,
      message: `${params.companyId} 삭제 완료`,
      data: null,
    });
  }),
];
