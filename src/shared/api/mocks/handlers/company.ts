import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

const workplacesByCompany: Record<number, { id: number; companyId: number; companyName: string; workplaceName: string; address: string; bizNumber: string }[]> = {
  1: [
    { id: 101, companyId: 1,  companyName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 서울본사',  address: '서울특별시 강남구 테헤란로 123',            bizNumber: '238-32482-34' },
    { id: 102, companyId: 1,  companyName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 울산공장',  address: '울산광역시 북구 산업로 300',                bizNumber: '238-32482-35' },
    { id: 103, companyId: 1,  companyName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 부산지사',  address: '부산광역시 해운대구 센텀중앙로 55',          bizNumber: '238-32482-36' },
  ],
  2: [
    // { id: 104, companyId: 2,  companyName: '대성산업(주)',      workplaceName: '대성산업(주) 수원본사',       address: '경기도 수원시 영통구 월드컵로 206',          bizNumber: '401-29384-55' },
    // { id: 105, companyId: 2,  companyName: '대성산업(주)',      workplaceName: '대성산업(주) 화성공장',       address: '경기도 화성시 팔탄면 서탄로 200',            bizNumber: '401-29384-56' },
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

export const companyHandlers = [
  http.get(`${BASE_URL}/companies`, () => {
    return HttpResponse.json({
      status: true,
      message: '측정대행 의뢰기관 목록 조회 성공',
      data: [
        { id: 1,  name: '(주)한국환경기술', representative: '가나다',  address: '서울특별시 강남구 테헤란로 123',          bizNumber: '238-32482-34' },
        { id: 2,  name: '대성산업(주)',      representative: '박철호',  address: '경기도 수원시 영통구 월드컵로 206',        bizNumber: '401-29384-55' },
        { id: 3,  name: '동아화학공업',      representative: '정성훈',  address: '부산광역시 사하구 하신중앙로 99',          bizNumber: '611-47832-43' },
        { id: 4,  name: '(주)그린에너지',    representative: '임수진',  address: '대전광역시 유성구 대덕대로 512',           bizNumber: '803-72918-54' },
        { id: 5, name: '삼진제조(주)',       representative: '오태현',  address: '대구광역시 달서구 성서산업로 100',         bizNumber: '104-93847-62' },
        { id: 6, name: '한빛소재산업',       representative: '유준서',  address: '광주광역시 광산구 하남산단 6번로 107',     bizNumber: '126-61573-28' },
        { id: 7, name: '(주)미래환경',       representative: '남기훈',  address: '인천광역시 남동구 남동공단로 215',         bizNumber: '137-43829-16' },
        { id: 8, name: '세진중공업(주)',      representative: '조현우',  address: '경상남도 창원시 성산구 공단로 730',        bizNumber: '159-38274-61' },
        { id: 9, name: '(주)태양기술',        representative: '황성진',  address: '서울특별시 마포구 월드컵북로 396',         bizNumber: '173-58291-34' },
        { id: 10, name: '경남산업(주)',         representative: '홍길동',  address: '부산광역시 강서구 신항대로 345',           bizNumber: '184-73618-52' },
        { id: 11, name: '현대에너지(주)',       representative: '안준혁',  address: '울산광역시 남구 삼산로 100',               bizNumber: '195-46827-93' },
        { id: 12, name: '(주)청정환경',         representative: '송미경',  address: '경기도 성남시 분당구 판교로 256',          bizNumber: '207-85136-74' },
      ],
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

  http.get(`${BASE_URL}/workplaces`, ({ request }) => {
    const url = new URL(request.url);
    const companyId = Number(url.searchParams.get('companyId'));
    const workplaces = workplacesByCompany[companyId] ?? [];
    return HttpResponse.json({
      status: true,
      message: '측정대상 사업장 목록 조회 성공',
      data: workplaces,
    });
  }),
];
