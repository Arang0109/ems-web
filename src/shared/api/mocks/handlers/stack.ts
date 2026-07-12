import { http, HttpResponse } from 'msw';
import type { MeasurementField, Grade, Shape, Orientation } from '@shared/model';

const BASE_URL = 'http://localhost:8080/api';

type StackRow = {
  id: number;
  clientName: string;
  workplaceName: string;
  field: MeasurementField;
  stackName: string;
  createdAt: string;
  modifiedAt: string;
};

const stacksByWorkplace: Record<number, StackRow[]> = {
  101: [
    { id: 1001, clientName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 서울본사',   field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2025-03-10', modifiedAt: '2025-11-15' },
    { id: 1002, clientName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 서울본사',   field: 'AIR',             stackName: '2호 굴뚝',      createdAt: '2025-03-10', modifiedAt: '2026-01-20' },
  ],
  102: [
    { id: 1003, clientName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 울산공장',   field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2024-07-01', modifiedAt: '2025-09-05' },
    { id: 1004, clientName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 울산공장',   field: 'AIR',             stackName: '2호 굴뚝',      createdAt: '2024-07-01', modifiedAt: '2025-09-05' },
    { id: 1005, clientName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 울산공장',   field: 'AIR',             stackName: '3호 굴뚝',      createdAt: '2024-08-15', modifiedAt: '2025-12-10' },
  ],
  103: [
    { id: 1006, clientName: '(주)한국환경기술', workplaceName: '(주)한국환경기술 부산지사',   field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2025-01-20', modifiedAt: '2025-10-01' },
  ],
  106: [
    { id: 1007, clientName: '동아화학공업',      workplaceName: '동아화학공업 부산본사',       field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2024-05-12', modifiedAt: '2025-08-22' },
    { id: 1008, clientName: '동아화학공업',      workplaceName: '동아화학공업 부산본사',       field: 'WATER',           stackName: '1호 배출구',    createdAt: '2024-05-12', modifiedAt: '2025-08-22' },
    { id: 1009, clientName: '동아화학공업',      workplaceName: '동아화학공업 부산본사',       field: 'WATER',           stackName: '2호 배출구',    createdAt: '2024-06-30', modifiedAt: '2026-02-14' },
  ],
  107: [
    { id: 1010, clientName: '동아화학공업',      workplaceName: '동아화학공업 창원공장',       field: 'WATER',           stackName: '1호 배출구',    createdAt: '2023-11-01', modifiedAt: '2025-07-18' },
    { id: 1011, clientName: '동아화학공업',      workplaceName: '동아화학공업 창원공장',       field: 'WATER',           stackName: '2호 배출구',    createdAt: '2023-11-01', modifiedAt: '2025-07-18' },
    { id: 1012, clientName: '동아화학공업',      workplaceName: '동아화학공업 창원공장',       field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2024-03-05', modifiedAt: '2025-11-30' },
    { id: 1013, clientName: '동아화학공업',      workplaceName: '동아화학공업 창원공장',       field: 'AIR',             stackName: '2호 굴뚝',      createdAt: '2024-03-05', modifiedAt: '2026-01-08' },
  ],
  108: [
    { id: 1014, clientName: '동아화학공업',      workplaceName: '동아화학공업 거제사업장',     field: 'WATER',           stackName: '1호 배출구',    createdAt: '2025-02-17', modifiedAt: '2025-12-03' },
    { id: 1015, clientName: '동아화학공업',      workplaceName: '동아화학공업 거제사업장',     field: 'WATER',           stackName: '2호 배출구',    createdAt: '2025-02-17', modifiedAt: '2026-03-20' },
  ],
  109: [
    { id: 1016, clientName: '(주)그린에너지',    workplaceName: '(주)그린에너지 대전본사',     field: 'ODOR',            stackName: '악취 측정지점 1', createdAt: '2024-09-09', modifiedAt: '2025-10-25' },
    { id: 1017, clientName: '(주)그린에너지',    workplaceName: '(주)그린에너지 대전본사',     field: 'ODOR',            stackName: '악취 측정지점 2', createdAt: '2024-09-09', modifiedAt: '2026-02-01' },
  ],
  110: [
    { id: 1018, clientName: '(주)그린에너지',    workplaceName: '(주)그린에너지 세종사업장',   field: 'ODOR',            stackName: '악취 측정지점 1', createdAt: '2025-04-22', modifiedAt: '2025-12-11' },
  ],
  111: [
    { id: 1019, clientName: '삼진제조(주)',       workplaceName: '삼진제조(주) 대구본사',       field: 'NOISE_VIBRATION', stackName: '측정지점 1',    createdAt: '2024-02-14', modifiedAt: '2025-09-16' },
    { id: 1020, clientName: '삼진제조(주)',       workplaceName: '삼진제조(주) 대구본사',       field: 'NOISE_VIBRATION', stackName: '측정지점 2',    createdAt: '2024-02-14', modifiedAt: '2025-09-16' },
  ],
  112: [
    { id: 1021, clientName: '삼진제조(주)',       workplaceName: '삼진제조(주) 구미공장',       field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2023-08-30', modifiedAt: '2025-06-27' },
    { id: 1022, clientName: '삼진제조(주)',       workplaceName: '삼진제조(주) 구미공장',       field: 'AIR',             stackName: '2호 굴뚝',      createdAt: '2023-08-30', modifiedAt: '2025-06-27' },
    { id: 1023, clientName: '삼진제조(주)',       workplaceName: '삼진제조(주) 구미공장',       field: 'NOISE_VIBRATION', stackName: '측정지점 1',    createdAt: '2024-01-10', modifiedAt: '2026-01-15' },
  ],
  113: [
    { id: 1024, clientName: '삼진제조(주)',       workplaceName: '삼진제조(주) 포항사업장',     field: 'NOISE_VIBRATION', stackName: '측정지점 1',    createdAt: '2024-11-05', modifiedAt: '2026-03-01' },
    { id: 1025, clientName: '삼진제조(주)',       workplaceName: '삼진제조(주) 포항사업장',     field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2024-11-05', modifiedAt: '2026-03-01' },
  ],
  114: [
    { id: 1026, clientName: '한빛소재산업',       workplaceName: '한빛소재산업 광주본사',       field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2024-04-18', modifiedAt: '2025-10-09' },
    { id: 1027, clientName: '한빛소재산업',       workplaceName: '한빛소재산업 광주본사',       field: 'AIR',             stackName: '2호 굴뚝',      createdAt: '2024-04-18', modifiedAt: '2025-10-09' },
    { id: 1028, clientName: '한빛소재산업',       workplaceName: '한빛소재산업 광주본사',       field: 'AIR',             stackName: '3호 굴뚝',      createdAt: '2024-05-25', modifiedAt: '2026-02-22' },
  ],
  115: [
    { id: 1029, clientName: '한빛소재산업',       workplaceName: '한빛소재산업 나주공장',       field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2025-06-03', modifiedAt: '2026-01-17' },
  ],
  116: [
    { id: 1030, clientName: '(주)미래환경',       workplaceName: '(주)미래환경 인천본사',       field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2024-10-07', modifiedAt: '2025-11-04' },
    { id: 1031, clientName: '(주)미래환경',       workplaceName: '(주)미래환경 인천본사',       field: 'AIR',             stackName: '2호 굴뚝',      createdAt: '2024-10-07', modifiedAt: '2026-02-28' },
  ],
  117: [
    { id: 1032, clientName: '(주)미래환경',       workplaceName: '(주)미래환경 시흥사업장',     field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2023-12-12', modifiedAt: '2025-08-14' },
    { id: 1033, clientName: '(주)미래환경',       workplaceName: '(주)미래환경 시흥사업장',     field: 'AIR',             stackName: '2호 굴뚝',      createdAt: '2023-12-12', modifiedAt: '2025-08-14' },
    { id: 1034, clientName: '(주)미래환경',       workplaceName: '(주)미래환경 시흥사업장',     field: 'AIR',             stackName: '3호 굴뚝',      createdAt: '2024-02-28', modifiedAt: '2025-12-19' },
  ],
  118: [
    { id: 1035, clientName: '(주)미래환경',       workplaceName: '(주)미래환경 안산공장',       field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2025-05-16', modifiedAt: '2026-03-10' },
  ],
  119: [
    { id: 1036, clientName: '세진중공업(주)',      workplaceName: '세진중공업(주) 창원본사',     field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2024-06-20', modifiedAt: '2025-09-30' },
    { id: 1037, clientName: '세진중공업(주)',      workplaceName: '세진중공업(주) 창원본사',     field: 'AIR',             stackName: '2호 굴뚝',      createdAt: '2024-06-20', modifiedAt: '2025-09-30' },
    { id: 1038, clientName: '세진중공업(주)',      workplaceName: '세진중공업(주) 창원본사',     field: 'NOISE_VIBRATION', stackName: '측정지점 1',    createdAt: '2024-07-15', modifiedAt: '2026-01-06' },
    { id: 1039, clientName: '세진중공업(주)',      workplaceName: '세진중공업(주) 창원본사',     field: 'NOISE_VIBRATION', stackName: '측정지점 2',    createdAt: '2024-07-15', modifiedAt: '2026-01-06' },
  ],
  120: [
    { id: 1040, clientName: '세진중공업(주)',      workplaceName: '세진중공업(주) 거제조선소',   field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2023-09-25', modifiedAt: '2025-07-07' },
    { id: 1041, clientName: '세진중공업(주)',      workplaceName: '세진중공업(주) 거제조선소',   field: 'WATER',           stackName: '1호 배출구',    createdAt: '2023-09-25', modifiedAt: '2025-07-07' },
  ],
  121: [
    { id: 1042, clientName: '(주)태양기술',        workplaceName: '(주)태양기술 서울본사',       field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2025-01-08', modifiedAt: '2025-11-22' },
  ],
  122: [
    { id: 1043, clientName: '(주)태양기술',        workplaceName: '(주)태양기술 용인R&D센터',    field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2024-12-01', modifiedAt: '2025-10-13' },
    { id: 1044, clientName: '(주)태양기술',        workplaceName: '(주)태양기술 용인R&D센터',    field: 'AIR',             stackName: '2호 굴뚝',      createdAt: '2024-12-01', modifiedAt: '2026-02-05' },
  ],
  123: [
    { id: 1045, clientName: '경남산업(주)',         workplaceName: '경남산업(주) 부산본사',       field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2024-03-28', modifiedAt: '2025-08-31' },
    { id: 1046, clientName: '경남산업(주)',         workplaceName: '경남산업(주) 부산본사',       field: 'AIR',             stackName: '2호 굴뚝',      createdAt: '2024-03-28', modifiedAt: '2025-08-31' },
  ],
  124: [
    { id: 1047, clientName: '경남산업(주)',         workplaceName: '경남산업(주) 김해공장',       field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2023-07-14', modifiedAt: '2025-06-02' },
    { id: 1048, clientName: '경남산업(주)',         workplaceName: '경남산업(주) 김해공장',       field: 'AIR',             stackName: '2호 굴뚝',      createdAt: '2023-07-14', modifiedAt: '2025-06-02' },
    { id: 1049, clientName: '경남산업(주)',         workplaceName: '경남산업(주) 김해공장',       field: 'WATER',           stackName: '1호 배출구',    createdAt: '2023-10-20', modifiedAt: '2026-03-15' },
  ],
  125: [
    { id: 1050, clientName: '경남산업(주)',         workplaceName: '경남산업(주) 밀양사업장',     field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2025-07-01', modifiedAt: '2026-04-10' },
  ],
  126: [
    { id: 1051, clientName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산본사',     field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2024-01-17', modifiedAt: '2025-07-29' },
    { id: 1052, clientName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산본사',     field: 'AIR',             stackName: '2호 굴뚝',      createdAt: '2024-01-17', modifiedAt: '2025-07-29' },
    { id: 1053, clientName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산본사',     field: 'AIR',             stackName: '3호 굴뚝',      createdAt: '2024-01-17', modifiedAt: '2026-02-17' },
  ],
  127: [
    { id: 1054, clientName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산공장',     field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2023-05-09', modifiedAt: '2025-05-20' },
    { id: 1055, clientName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산공장',     field: 'AIR',             stackName: '2호 굴뚝',      createdAt: '2023-05-09', modifiedAt: '2025-05-20' },
    { id: 1056, clientName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산공장',     field: 'AIR',             stackName: '3호 굴뚝',      createdAt: '2023-06-18', modifiedAt: '2025-11-11' },
    { id: 1057, clientName: '현대에너지(주)',       workplaceName: '현대에너지(주) 울산공장',     field: 'AIR',             stackName: '4호 굴뚝',      createdAt: '2023-06-18', modifiedAt: '2026-01-29' },
  ],
  128: [
    { id: 1058, clientName: '현대에너지(주)',       workplaceName: '현대에너지(주) 여수사업장',   field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2024-08-04', modifiedAt: '2025-12-26' },
    { id: 1059, clientName: '현대에너지(주)',       workplaceName: '현대에너지(주) 여수사업장',   field: 'AIR',             stackName: '2호 굴뚝',      createdAt: '2024-08-04', modifiedAt: '2026-03-08' },
  ],
  129: [
    { id: 1060, clientName: '(주)청정환경',         workplaceName: '(주)청정환경 판교본사',       field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2025-09-11', modifiedAt: '2026-04-02' },
    { id: 1061, clientName: '(주)청정환경',         workplaceName: '(주)청정환경 판교본사',       field: 'AIR',             stackName: '2호 굴뚝',      createdAt: '2025-09-11', modifiedAt: '2026-04-02' },
  ],
  130: [
    { id: 1062, clientName: '(주)청정환경',         workplaceName: '(주)청정환경 수원연구소',     field: 'AIR',             stackName: '1호 굴뚝',      createdAt: '2025-10-23', modifiedAt: '2026-04-18' },
  ],
};

type StackDetailRow = {
  id: number;
  workplaceId: number;
  field: MeasurementField;
  name: string;
  semsNumber: string;
  grade: Grade;
  businessCategory: string;
  mainProduct: string;
  height: string;
  horizontalLength: string;
  verticalLength: string;
  shape: Shape;
  orientation: Orientation;
  createdAt: string;
  modifiedAt: string;
  preventions: { id: number; stackId: number; name: string; targets: {id:number; name: string; removalEfficiency: string}[]; }[];
  facilities: { id: number; stackId: number; name: string; fuelUsage: string; fuelInput: string; fuelType: string }[];
};

const stackDetails: Record<number, StackDetailRow> = {
  1001: {
    id: 1001, workplaceId: 101, field: 'AIR', name: '1호 굴뚝',
    semsNumber: 'SEMS-2025-001', grade: 'TYPE_1',
    businessCategory: '화학물질 및 화학제품 제조업', mainProduct: '산업용 화학품',
    height: '45.5', horizontalLength: '1.2', verticalLength: '0.0',
    shape: 'CIRCULAR', orientation: 'VERTICAL',
    createdAt: '2025-03-10T09:00:00', modifiedAt: '2025-11-15T14:30:00',
    preventions: [
      { id: 1, stackId: 1001, name: '전기집진시설', targets: [{id:1, name:"입자상", removalEfficiency:"95.1"}] },
      { id: 2, stackId: 1001, name: '세정집진시설', targets: [{id:1, name:"가스상", removalEfficiency:"90"}, {id:1, name:"입자상", removalEfficiency:"75"}] },
    ],
    facilities: [
      { id: 1, stackId: 1001, name: '보일러 1호기', fuelUsage: '500', fuelInput: 'LNG', fuelType: '기체연료' },
      { id: 2, stackId: 1001, name: '소각로 1호기', fuelUsage: '200', fuelInput: '경유', fuelType: '액체연료' },
    ],
  },
  1002: {
    id: 1002, workplaceId: 101, field: 'AIR', name: '2호 굴뚝',
    semsNumber: 'SEMS-2025-002', grade: 'TYPE_2',
    businessCategory: '화학물질 및 화학제품 제조업', mainProduct: '산업용 화학품',
    height: '30.0', horizontalLength: '0.8', verticalLength: '0.0',
    shape: 'CIRCULAR', orientation: 'VERTICAL',
    createdAt: '2025-03-10T09:00:00', modifiedAt: '2026-01-20T11:00:00',
    preventions: [
      { id: 3, stackId: 1002, name: '여과집진시설', targets: [{id:1, name:"입자상", removalEfficiency:"95.1"}] },
    ],
    facilities: [
      { id: 3, stackId: 1002, name: '건조시설 1호기', fuelUsage: '300', fuelInput: '등유', fuelType: '액체연료' },
    ],
  },
  1008: {
    id: 1008, workplaceId: 106, field: 'WATER', name: '1호 배출구',
    semsNumber: 'SEMS-2024-008', grade: 'TYPE_3',
    businessCategory: '기초화학물질 제조업', mainProduct: '합성수지',
    height: '0.0', horizontalLength: '0.5', verticalLength: '0.3',
    shape: 'RECTANGULAR', orientation: 'HORIZONTAL',
    createdAt: '2024-05-12T08:00:00', modifiedAt: '2025-08-22T16:00:00',
    preventions: [
      { id: 4, stackId: 1008, name: '폐수처리시설', targets: [{id:1, name:"입자상", removalEfficiency:"95.1"}] },
    ],
    facilities: [
      { id: 4, stackId: 1008, name: '반응조 1호기', fuelUsage: '0', fuelInput: '-', fuelType: '-' },
      { id: 5, stackId: 1008, name: '반응조 2호기', fuelUsage: '0', fuelInput: '-', fuelType: '-' },
    ],
  },
  1019: {
    id: 1019, workplaceId: 111, field: 'NOISE_VIBRATION', name: '측정지점 1',
    semsNumber: 'SEMS-2024-019', grade: 'TYPE_4',
    businessCategory: '금속 가공제품 제조업', mainProduct: '금속부품',
    height: '0.0', horizontalLength: '0.0', verticalLength: '0.0',
    shape: 'CIRCULAR', orientation: 'VERTICAL',
    createdAt: '2024-02-14T10:00:00', modifiedAt: '2025-09-16T09:00:00',
    preventions: [],
    facilities: [
      { id: 6, stackId: 1019, name: '프레스 1호기', fuelUsage: '0', fuelInput: '-', fuelType: '-' },
    ],
  },
};

export const stackHandlers = [
  http.get(`${BASE_URL}/stacks/:stackId`, ({ params }) => {
    const stackId = Number(params.stackId);
    const detail = stackDetails[stackId];
    if (!detail) {
      return HttpResponse.json({ status: false, message: '측정시설을 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    return HttpResponse.json({ status: true, message: '측정시설 상세 조회 성공', data: detail });
  }),

  http.get(`${BASE_URL}/stacks`, ({ request }) => {
    const url = new URL(request.url);
    const workplaceIdParam = url.searchParams.get('workplaceId');
    const stacks = workplaceIdParam
      ? (stacksByWorkplace[Number(workplaceIdParam)] ?? [])
      : Object.values(stacksByWorkplace).flat();
    return HttpResponse.json({
      status: true,
      message: '측정시설 목록 조회 성공',
      data: stacks,
    });
  }),

  http.post(`${BASE_URL}/stacks`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      status: true,
      message: '측정시설 등록 성공',
      data: { id: Date.now(), ...body }
    }, { status: 201 });
  }),

  http.put(`${BASE_URL}/stacks/:stackId`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      status: true,
      message: '측정시설 수정 성공',
      data: { id: Number(params.stackId), ...body }
    });
  }),

  // 방지시설 (preventions)
  http.post(`${BASE_URL}/preventions`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      status: true,
      message: '방지시설 등록 성공',
      data: { id: Date.now(), targets: [], ...body }
    }, { status: 201 });
  }),

  http.put(`${BASE_URL}/preventions/:preventionId`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      status: true,
      message: '방지시설 수정 성공',
      data: { id: Number(params.preventionId), ...body }
    });
  }),

  http.delete(`${BASE_URL}/preventions/:preventionId`, ({ params }) => {
    return HttpResponse.json({
      status: true,
      message: `${params.preventionId} 방지시설 삭제 완료`,
      data: null,
    });
  }),

  // 연료시설 (facilities)
  http.post(`${BASE_URL}/facilities`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      status: true,
      message: '연료시설 등록 성공',
      data: { id: Date.now(), ...body }
    }, { status: 201 });
  }),

  http.put(`${BASE_URL}/facilities/:facilityId`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      status: true,
      message: '연료시설 수정 성공',
      data: { id: Number(params.facilityId), ...body }
    });
  }),

  http.delete(`${BASE_URL}/facilities/:facilityId`, ({ params }) => {
    return HttpResponse.json({
      status: true,
      message: `${params.facilityId} 연료시설 삭제 완료`,
      data: null,
    });
  }),

  // 대상물질 (target-substances)
  http.post(`${BASE_URL}/target-substances`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      status: true,
      message: '대상물질 등록 성공',
      data: { id: Date.now(), ...body }
    }, { status: 201 });
  }),

  http.delete(`${BASE_URL}/target-substances/:substanceId`, ({ params }) => {
    return HttpResponse.json({
      status: true,
      message: `${params.substanceId} 대상물질 삭제 완료`,
      data: null,
    });
  }),
];
