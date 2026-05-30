import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

type StackRow = {
  id: number;
  companyName: string;
  workplaceName: string;
  field: 'air';
  stackName: string;
  createdAt: string;
  modifiedAt: string;
};

const stacksByWorkplace: Record<number, StackRow[]> = {
  101: [
    { id: 1001, companyName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 서울본사',   field: 'air', stackName: '1호 굴뚝',   createdAt: '2025-03-10', modifiedAt: '2025-11-15' },
    { id: 1002, companyName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 서울본사',   field: 'air', stackName: '2호 굴뚝',   createdAt: '2025-03-10', modifiedAt: '2026-01-20' },
  ],
  102: [
    { id: 1003, companyName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 울산공장',   field: 'air', stackName: '1호 굴뚝',   createdAt: '2024-07-01', modifiedAt: '2025-09-05' },
    { id: 1004, companyName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 울산공장',   field: 'air', stackName: '2호 굴뚝',   createdAt: '2024-07-01', modifiedAt: '2025-09-05' },
    { id: 1005, companyName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 울산공장',   field: 'air', stackName: '3호 굴뚝',   createdAt: '2024-08-15', modifiedAt: '2025-12-10' },
  ],
  103: [
    { id: 1006, companyName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 부산지사',   field: 'air', stackName: '1호 굴뚝',   createdAt: '2025-01-20', modifiedAt: '2025-10-01' },
  ],
  106: [
    { id: 1007, companyName: '동아화학공업',      workplaceName: '동아화학공업 부산본사',       field: 'air', stackName: '1호 굴뚝',   createdAt: '2024-05-12', modifiedAt: '2025-08-22' },
    { id: 1008, companyName: '동아화학공업',      workplaceName: '동아화학공업 부산본사',       field: 'air', stackName: '2호 굴뚝',   createdAt: '2024-05-12', modifiedAt: '2025-08-22' },
    { id: 1009, companyName: '동아화학공업',      workplaceName: '동아화학공업 부산본사',       field: 'air', stackName: '3호 굴뚝',   createdAt: '2024-06-30', modifiedAt: '2026-02-14' },
  ],
  107: [
    { id: 1010, companyName: '동아화학공업',      workplaceName: '동아화학공업 창원공장',       field: 'air', stackName: '1호 굴뚝',   createdAt: '2023-11-01', modifiedAt: '2025-07-18' },
    { id: 1011, companyName: '동아화학공업',      workplaceName: '동아화학공업 창원공장',       field: 'air', stackName: '2호 굴뚝',   createdAt: '2023-11-01', modifiedAt: '2025-07-18' },
    { id: 1012, companyName: '동아화학공업',      workplaceName: '동아화학공업 창원공장',       field: 'air', stackName: '3호 굴뚝',   createdAt: '2024-03-05', modifiedAt: '2025-11-30' },
    { id: 1013, companyName: '동아화학공업',      workplaceName: '동아화학공업 창원공장',       field: 'air', stackName: '4호 굴뚝',   createdAt: '2024-03-05', modifiedAt: '2026-01-08' },
  ],
  108: [
    { id: 1014, companyName: '동아화학공업',      workplaceName: '동아화학공업 거제사업장',     field: 'air', stackName: '1호 굴뚝',   createdAt: '2025-02-17', modifiedAt: '2025-12-03' },
    { id: 1015, companyName: '동아화학공업',      workplaceName: '동아화학공업 거제사업장',     field: 'air', stackName: '2호 굴뚝',   createdAt: '2025-02-17', modifiedAt: '2026-03-20' },
  ],
  109: [
    { id: 1016, companyName: '(주)그린에너지',    workplaceName: '(주)그린에너지 대전본사',     field: 'air', stackName: '1호 굴뚝',   createdAt: '2024-09-09', modifiedAt: '2025-10-25' },
    { id: 1017, companyName: '(주)그린에너지',    workplaceName: '(주)그린에너지 대전본사',     field: 'air', stackName: '2호 굴뚝',   createdAt: '2024-09-09', modifiedAt: '2026-02-01' },
  ],
  110: [
    { id: 1018, companyName: '(주)그린에너지',    workplaceName: '(주)그린에너지 세종사업장',   field: 'air', stackName: '1호 굴뚝',   createdAt: '2025-04-22', modifiedAt: '2025-12-11' },
  ],
  111: [
    { id: 1019, companyName: '삼진제조(주)',       workplaceName: '삼진제조(주) 대구본사',       field: 'air', stackName: '1호 굴뚝',   createdAt: '2024-02-14', modifiedAt: '2025-09-16' },
    { id: 1020, companyName: '삼진제조(주)',       workplaceName: '삼진제조(주) 대구본사',       field: 'air', stackName: '2호 굴뚝',   createdAt: '2024-02-14', modifiedAt: '2025-09-16' },
  ],
  112: [
    { id: 1021, companyName: '삼진제조(주)',       workplaceName: '삼진제조(주) 구미공장',       field: 'air', stackName: '1호 굴뚝',   createdAt: '2023-08-30', modifiedAt: '2025-06-27' },
    { id: 1022, companyName: '삼진제조(주)',       workplaceName: '삼진제조(주) 구미공장',       field: 'air', stackName: '2호 굴뚝',   createdAt: '2023-08-30', modifiedAt: '2025-06-27' },
    { id: 1023, companyName: '삼진제조(주)',       workplaceName: '삼진제조(주) 구미공장',       field: 'air', stackName: '3호 굴뚝',   createdAt: '2024-01-10', modifiedAt: '2026-01-15' },
  ],
  113: [
    { id: 1024, companyName: '삼진제조(주)',       workplaceName: '삼진제조(주) 포항사업장',     field: 'air', stackName: '1호 굴뚝',   createdAt: '2024-11-05', modifiedAt: '2026-03-01' },
    { id: 1025, companyName: '삼진제조(주)',       workplaceName: '삼진제조(주) 포항사업장',     field: 'air', stackName: '2호 굴뚝',   createdAt: '2024-11-05', modifiedAt: '2026-03-01' },
  ],
  114: [
    { id: 1026, companyName: '한빛소재산업',       workplaceName: '한빛소재산업 광주본사',       field: 'air', stackName: '1호 굴뚝',   createdAt: '2024-04-18', modifiedAt: '2025-10-09' },
    { id: 1027, companyName: '한빛소재산업',       workplaceName: '한빛소재산업 광주본사',       field: 'air', stackName: '2호 굴뚝',   createdAt: '2024-04-18', modifiedAt: '2025-10-09' },
    { id: 1028, companyName: '한빛소재산업',       workplaceName: '한빛소재산업 광주본사',       field: 'air', stackName: '3호 굴뚝',   createdAt: '2024-05-25', modifiedAt: '2026-02-22' },
  ],
  115: [
    { id: 1029, companyName: '한빛소재산업',       workplaceName: '한빛소재산업 나주공장',       field: 'air', stackName: '1호 굴뚝',   createdAt: '2025-06-03', modifiedAt: '2026-01-17' },
  ],
  116: [
    { id: 1030, companyName: '(주)미래환경',       workplaceName: '(주)미래환경 인천본사',       field: 'air', stackName: '1호 굴뚝',   createdAt: '2024-10-07', modifiedAt: '2025-11-04' },
    { id: 1031, companyName: '(주)미래환경',       workplaceName: '(주)미래환경 인천본사',       field: 'air', stackName: '2호 굴뚝',   createdAt: '2024-10-07', modifiedAt: '2026-02-28' },
  ],
  117: [
    { id: 1032, companyName: '(주)미래환경',       workplaceName: '(주)미래환경 시흥사업장',     field: 'air', stackName: '1호 굴뚝',   createdAt: '2023-12-12', modifiedAt: '2025-08-14' },
    { id: 1033, companyName: '(주)미래환경',       workplaceName: '(주)미래환경 시흥사업장',     field: 'air', stackName: '2호 굴뚝',   createdAt: '2023-12-12', modifiedAt: '2025-08-14' },
    { id: 1034, companyName: '(주)미래환경',       workplaceName: '(주)미래환경 시흥사업장',     field: 'air', stackName: '3호 굴뚝',   createdAt: '2024-02-28', modifiedAt: '2025-12-19' },
  ],
  118: [
    { id: 1035, companyName: '(주)미래환경',       workplaceName: '(주)미래환경 안산공장',       field: 'air', stackName: '1호 굴뚝',   createdAt: '2025-05-16', modifiedAt: '2026-03-10' },
  ],
  119: [
    { id: 1036, companyName: '세진중공업(주)',      workplaceName: '세진중공업(주) 창원본사',     field: 'air', stackName: '1호 굴뚝',   createdAt: '2024-06-20', modifiedAt: '2025-09-30' },
    { id: 1037, companyName: '세진중공업(주)',      workplaceName: '세진중공업(주) 창원본사',     field: 'air', stackName: '2호 굴뚝',   createdAt: '2024-06-20', modifiedAt: '2025-09-30' },
    { id: 1038, companyName: '세진중공업(주)',      workplaceName: '세진중공업(주) 창원본사',     field: 'air', stackName: '3호 굴뚝',   createdAt: '2024-07-15', modifiedAt: '2026-01-06' },
    { id: 1039, companyName: '세진중공업(주)',      workplaceName: '세진중공업(주) 창원본사',     field: 'air', stackName: '4호 굴뚝',   createdAt: '2024-07-15', modifiedAt: '2026-01-06' },
  ],
  120: [
    { id: 1040, companyName: '세진중공업(주)',      workplaceName: '세진중공업(주) 거제조선소',   field: 'air', stackName: '1호 굴뚝',   createdAt: '2023-09-25', modifiedAt: '2025-07-07' },
    { id: 1041, companyName: '세진중공업(주)',      workplaceName: '세진중공업(주) 거제조선소',   field: 'air', stackName: '2호 굴뚝',   createdAt: '2023-09-25', modifiedAt: '2025-07-07' },
  ],
  121: [
    { id: 1042, companyName: '(주)태양기술',        workplaceName: '(주)태양기술 서울본사',       field: 'air', stackName: '1호 굴뚝',   createdAt: '2025-01-08', modifiedAt: '2025-11-22' },
  ],
  122: [
    { id: 1043, companyName: '(주)태양기술',        workplaceName: '(주)태양기술 용인R&D센터',    field: 'air', stackName: '1호 굴뚝',   createdAt: '2024-12-01', modifiedAt: '2025-10-13' },
    { id: 1044, companyName: '(주)태양기술',        workplaceName: '(주)태양기술 용인R&D센터',    field: 'air', stackName: '2호 굴뚝',   createdAt: '2024-12-01', modifiedAt: '2026-02-05' },
  ],
  123: [
    { id: 1045, companyName: '경남산업(주)',         workplaceName: '경남산업(주) 부산본사',       field: 'air', stackName: '1호 굴뚝',   createdAt: '2024-03-28', modifiedAt: '2025-08-31' },
    { id: 1046, companyName: '경남산업(주)',         workplaceName: '경남산업(주) 부산본사',       field: 'air', stackName: '2호 굴뚝',   createdAt: '2024-03-28', modifiedAt: '2025-08-31' },
  ],
  124: [
    { id: 1047, companyName: '경남산업(주)',         workplaceName: '경남산업(주) 김해공장',       field: 'air', stackName: '1호 굴뚝',   createdAt: '2023-07-14', modifiedAt: '2025-06-02' },
    { id: 1048, companyName: '경남산업(주)',         workplaceName: '경남산업(주) 김해공장',       field: 'air', stackName: '2호 굴뚝',   createdAt: '2023-07-14', modifiedAt: '2025-06-02' },
    { id: 1049, companyName: '경남산업(주)',         workplaceName: '경남산업(주) 김해공장',       field: 'air', stackName: '3호 굴뚝',   createdAt: '2023-10-20', modifiedAt: '2026-03-15' },
  ],
  125: [
    { id: 1050, companyName: '경남산업(주)',         workplaceName: '경남산업(주) 밀양사업장',     field: 'air', stackName: '1호 굴뚝',   createdAt: '2025-07-01', modifiedAt: '2026-04-10' },
  ],
  126: [
    { id: 1051, companyName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산본사',     field: 'air', stackName: '1호 굴뚝',   createdAt: '2024-01-17', modifiedAt: '2025-07-29' },
    { id: 1052, companyName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산본사',     field: 'air', stackName: '2호 굴뚝',   createdAt: '2024-01-17', modifiedAt: '2025-07-29' },
    { id: 1053, companyName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산본사',     field: 'air', stackName: '3호 굴뚝',   createdAt: '2024-01-17', modifiedAt: '2026-02-17' },
  ],
  127: [
    { id: 1054, companyName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산공장',     field: 'air', stackName: '1호 굴뚝',   createdAt: '2023-05-09', modifiedAt: '2025-05-20' },
    { id: 1055, companyName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산공장',     field: 'air', stackName: '2호 굴뚝',   createdAt: '2023-05-09', modifiedAt: '2025-05-20' },
    { id: 1056, companyName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산공장',     field: 'air', stackName: '3호 굴뚝',   createdAt: '2023-06-18', modifiedAt: '2025-11-11' },
    { id: 1057, companyName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산공장',     field: 'air', stackName: '4호 굴뚝',   createdAt: '2023-06-18', modifiedAt: '2026-01-29' },
  ],
  128: [
    { id: 1058, companyName: '현대에너지(주)',       workplaceName: '현대에너지(주) 여수사업장',   field: 'air', stackName: '1호 굴뚝',   createdAt: '2024-08-04', modifiedAt: '2025-12-26' },
    { id: 1059, companyName: '현대에너지(주)',       workplaceName: '현대에너지(주) 여수사업장',   field: 'air', stackName: '2호 굴뚝',   createdAt: '2024-08-04', modifiedAt: '2026-03-08' },
  ],
  129: [
    { id: 1060, companyName: '(주)청정환경',         workplaceName: '(주)청정환경 판교본사',       field: 'air', stackName: '1호 굴뚝',   createdAt: '2025-09-11', modifiedAt: '2026-04-02' },
    { id: 1061, companyName: '(주)청정환경',         workplaceName: '(주)청정환경 판교본사',       field: 'air', stackName: '2호 굴뚝',   createdAt: '2025-09-11', modifiedAt: '2026-04-02' },
  ],
  130: [
    { id: 1062, companyName: '(주)청정환경',         workplaceName: '(주)청정환경 수원연구소',     field: 'air', stackName: '1호 굴뚝',   createdAt: '2025-10-23', modifiedAt: '2026-04-18' },
  ],
};

export const stackHandlers = [
  http.get(`${BASE_URL}/stacks`, ({ request }) => {
    const url = new URL(request.url);
    const workplaceId = Number(url.searchParams.get('workplaceId'));
    const stacks = stacksByWorkplace[workplaceId] ?? [];
    return HttpResponse.json({
      status: true,
      message: '측정시설 목록 조회 성공',
      data: stacks,
    });
  }),
];