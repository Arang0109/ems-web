import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

type MockSchedule = {
  id: number;
  stackId: number;
  teamId: number;
  measurementField: 'AIR' | 'WATER' | 'NOISE_VIBRATION' | 'ODOR';
  measureDate: string;              // LocalDateTime
  measurementType: string | null;
  status: 'SCHEDULED' | 'MEASURING' | 'ANALYZING' | 'COMPLETED' | 'CANCELED';
  referenceNumber: string | null;
  clientName: string | null;
  stackName: string | null;
  teamName: string | null;
  createdAt: string;
};

const now = '2026-07-14T09:00:00';

let schedules: MockSchedule[] = [
  {
    id: 1, stackId: 1, teamId: 1, measurementField: 'AIR', measureDate: '2026-07-20T09:00:00',
    measurementType: 'SELF', status: 'SCHEDULED', referenceNumber: 'KGAR-26-01-001',
    clientName: '한국환경공단', stackName: '1호 배출구', teamName: '측정 1팀', createdAt: now,
  },
  {
    id: 2, stackId: 2, teamId: 2, measurementField: 'ODOR', measureDate: '2026-07-18T13:00:00',
    measurementType: 'REFERENCE', status: 'MEASURING', referenceNumber: 'KGAR-26-01-002',
    clientName: '대성산업', stackName: '2호 배출구', teamName: '측정 2팀', createdAt: now,
  },
  {
    id: 3, stackId: 3, teamId: 1, measurementField: 'WATER', measureDate: '2026-07-10T10:30:00',
    measurementType: 'SELF', status: 'ANALYZING', referenceNumber: 'KGAR-26-01-003',
    clientName: '삼성전자', stackName: '폐수 배출구', teamName: '측정 1팀', createdAt: now,
  },
  {
    id: 4, stackId: 4, teamId: 3, measurementField: 'NOISE_VIBRATION', measureDate: '2026-06-30T15:00:00',
    measurementType: 'REFERENCE', status: 'COMPLETED', referenceNumber: 'KGAR-26-01-004',
    clientName: 'LG화학', stackName: '북측 경계', teamName: '측정 3팀', createdAt: now,
  },
  {
    id: 5, stackId: 5, teamId: 2, measurementField: 'AIR', measureDate: '2026-06-25T11:00:00',
    measurementType: 'SELF', status: 'CANCELED', referenceNumber: null,
    clientName: '현대제철', stackName: '3호 배출구', teamName: '측정 2팀', createdAt: now,
  },
];

// ── 시트 저장소 (계획별 측정 시트 메모리 보관) ─────────────────
const STANDARD_OXYGEN = 4; // 계산 외부 입력 (StackSnapshot.standardOxygen)
const sheetStore: Record<number, unknown[]> = {};

const round = (v: number, digits: number): number => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};

const avg = (arr: unknown[]): number | null => {
  const nums = arr.filter((v): v is number => typeof v === 'number');
  if (nums.length === 0) return null;
  return round(nums.reduce((a, b) => a + b, 0) / nums.length, 2);
};

// 계산에 사용하는 필드만 명시한 느슨한 시트 형태(나머지는 그대로 통과).
interface LooseSheet {
  measurementPoints?: { Ts?: number; Pv?: number; Ps?: number }[];
  weather?: { pressure?: { pressure?: number }; pa?: number | null };
  exhaustGas?: { o2Concentration?: number[]; o2CorrectionFactor?: number | null };
  [key: string]: unknown;
}

// 서버 SheetCalculator의 핵심만 흉내낸다 (avgTg/avgPv/avgPs/pa/o2CorrectionFactor).
const computeSheet = (sheet: LooseSheet): LooseSheet => {
  const points = sheet.measurementPoints ?? [];
  const avgTg = avg(points.map((p) => (typeof p.Ts === 'number' ? p.Ts + 273 : null)));
  const avgPv = avg(points.map((p) => p.Pv));
  const avgPs = avg(points.map((p) => p.Ps));

  const hpa = sheet.weather?.pressure?.pressure;
  const pa = typeof hpa === 'number' ? round((hpa * 760) / 1013.25, 2) : null;

  const o2Avg = avg(sheet.exhaustGas?.o2Concentration ?? []);
  const o2CorrectionFactor =
    o2Avg != null && 21 - o2Avg !== 0 ? round((21 - STANDARD_OXYGEN) / (21 - o2Avg), 5) : null;

  return {
    ...sheet,
    avgTg, avgPv, avgPs, avgTm: null,
    weather: { ...sheet.weather, pa },
    exhaustGas: { ...sheet.exhaustGas, o2CorrectionFactor },
  };
};

// 측정계획 상세 스냅샷 구성 (표시·계산 검증에 필요한 최소 트리).
const buildSnapshot = (schedule: MockSchedule) => ({
  id: `snap-${schedule.id}`,
  scheduleId: schedule.id,
  tenantId: 1,
  referenceNumber: schedule.referenceNumber,
  status: schedule.status,
  basicInfo: {
    referenceNumber: schedule.referenceNumber,
    measureDate: schedule.measureDate,
    measurementField: schedule.measurementField,
    measurementType: schedule.measurementType,
  },
  team: {
    teamId: schedule.teamId, teamName: schedule.teamName ?? '측정팀',
    mentorUserId: 1, mentorName: '김사수', menteeUserId: 2, menteeName: '이부사수',
    particleSamplerId: 'eq-ps-1', gasSamplerId: 'eq-gs-1', pitotTubeId: 'eq-pt-1', nozzleId: 'eq-nz-1',
  },
  client: {
    clientId: 1, name: schedule.clientName ?? '한국환경공단', bizNumber: '2208201234',
    representative: '홍길동', roadAddress: '서울시 강남구 테헤란로 1', detailAddress: '10층',
    zipcode: '06234', manager: '박담당', email: 'manager@example.com', tel: '01012345678',
    workplace: {
      workplaceId: 1, name: '제1사업장', bizNumber: '2208201234',
      roadAddress: '경기도 화성시 산단로 5', detailAddress: 'A동', zipcode: '18469', grade: 'TYPE_1',
      stack: {
        stackId: schedule.stackId, field: schedule.measurementField,
        name: schedule.stackName ?? '1호 배출구', semsNumber: '1234567890', grade: 'TYPE_1',
        businessCategory: '화학제품 제조업', mainProduct: '합성수지',
        standardOxygen: STANDARD_OXYGEN, height: 25, horizontalLength: 1.2, verticalLength: null,
        shape: 'CIRCULAR', orientation: 'VERTICAL',
        facilities: [
          {
            facilityId: 1, name: '보일러 #1', fuelUsage: 'LNG', productOutput: '1200',
            incinerationAmount: '0', fuelInput: '500', fuelType: '기체', unit: 'kg/h',
          },
        ],
        preventions: [
          {
            preventionId: 1, name: '여과집진기', capacity: 500,
            targetName: '먼지', removalEfficiency: '99.5',
          },
        ],
      },
    },
  },
  equipments: [
    {
      equipmentId: 'eq-ps-1', type: 'PARTICLE_SAMPLER', managementNumber: 'PS-001', serialNumber: 'SN-PS-001',
      modelName: 'APEX-PS', equipmentName: '입자상 채취기', alias: 'PS1', manufacturer: 'Apex',
      calibrationCycle: 12, lastCalibrationDate: '2026-01-15',
      spec: { totalVolume: 1000, orificeDp: 1.84, yd: 0.99 },
    },
    {
      equipmentId: 'eq-gs-1', type: 'GAS_SAMPLER', managementNumber: 'GS-001', serialNumber: 'SN-GS-001',
      modelName: 'APEX-GS', equipmentName: '가스상 채취기', alias: 'GS1', manufacturer: 'Apex',
      calibrationCycle: 12, lastCalibrationDate: '2026-01-15', spec: { totalVolume: 800 },
    },
    {
      equipmentId: 'eq-pt-1', type: 'PITOT_TUBE', managementNumber: 'PT-001', serialNumber: 'SN-PT-001',
      modelName: 'S-Type', equipmentName: '피토관', alias: 'PT1', manufacturer: 'Dwyer',
      calibrationCycle: 12, lastCalibrationDate: '2026-01-15',
      spec: { pitotTubeType: 'DUST', coefficients: [{ coefficient: 0.84, velocity: 5 }, { coefficient: 0.85, velocity: 10 }] },
    },
    {
      equipmentId: 'eq-nz-1', type: 'NOZZLE', managementNumber: 'NZ-001', serialNumber: 'SN-NZ-001',
      modelName: 'Nozzle-Set', equipmentName: '노즐', alias: 'NZ1', manufacturer: 'Apex',
      calibrationCycle: 12, lastCalibrationDate: '2026-01-15',
      spec: { diameters: [{ diameter: 0.6 }, { diameter: 0.8 }, { diameter: 1.0 }] },
    },
  ],
  items: [
    {
      stackPollutantId: 1, pollutantId: 1, nameKr: '먼지', nameEn: 'Dust', field: schedule.measurementField,
      method: 'DUST', phase: 'PARTICLE', equipment: '입자상 채취기', testMethod: 'ES 01301', cycle: 'QUARTERLY', allowance: 30,
    },
    {
      stackPollutantId: 2, pollutantId: 2, nameKr: '질소산화물', nameEn: 'NOx', field: schedule.measurementField,
      method: 'FIELD_MEASUREMENT', phase: 'GAS', equipment: '가스분석기', testMethod: 'ES 01310', cycle: 'QUARTERLY', allowance: 150,
    },
  ],
  sheets: sheetStore[schedule.id] ?? [],
});

const buildScheduleResponse = (schedule: MockSchedule) => ({
  id: schedule.id, tenantId: 1, stackId: schedule.stackId, teamId: schedule.teamId,
  measurementField: schedule.measurementField, measureDate: schedule.measureDate,
  measurementType: schedule.measurementType, status: schedule.status,
  referenceNumber: schedule.referenceNumber, createdAt: schedule.createdAt, modifiedAt: schedule.createdAt,
  snapshot: buildSnapshot(schedule),
});

export const scheduleHandlers = [
  // 목록 조회
  http.get(`${BASE_URL}/schedules`, () => {
    return HttpResponse.json({ status: true, message: '측정계획 목록 조회 성공', data: schedules });
  }),

  // 상세 조회 (스냅샷 포함)
  http.get(`${BASE_URL}/schedules/:id`, ({ params }) => {
    const id = Number(params.id);
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) {
      return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    return HttpResponse.json({ status: true, message: '측정계획 상세 조회 성공', data: buildScheduleResponse(schedule) });
  }),

  // 측정 시트 저장 (서버 계산 흉내 후 저장)
  http.put(`${BASE_URL}/schedules/:id/sheets`, async ({ params, request }) => {
    const id = Number(params.id);
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) {
      return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    if (schedule.status === 'COMPLETED' || schedule.status === 'CANCELED') {
      return HttpResponse.json(
        { status: false, message: '완료 또는 취소된 측정계획은 수정할 수 없습니다.', data: null },
        { status: 409 },
      );
    }

    const body = (await request.json()) as { sheets: LooseSheet[] };
    sheetStore[id] = (body.sheets ?? []).map(computeSheet);

    return HttpResponse.json({ status: true, message: '측정 데이터 저장 성공', data: buildScheduleResponse(schedule) });
  }),

  // 등록 (동일 시설·팀·측정일 중복 시 409)
  http.post(`${BASE_URL}/schedules`, async ({ request }) => {
    const body = await request.json() as Partial<MockSchedule>;

    const duplicated = schedules.some(
      (s) => s.stackId === body.stackId
        && s.teamId === body.teamId
        && s.measureDate === body.measureDate,
    );
    if (duplicated) {
      return HttpResponse.json(
        { status: false, message: '이미 등록된 측정계획입니다. (동일 시설·팀·측정일)', data: null },
        { status: 409 },
      );
    }

    const created: MockSchedule = {
      id: Math.max(0, ...schedules.map((s) => s.id)) + 1,
      stackId: body.stackId ?? 0,
      teamId: body.teamId ?? 0,
      measurementField: body.measurementField ?? 'AIR',
      measureDate: body.measureDate ?? now,
      measurementType: body.measurementType ?? null,
      status: 'SCHEDULED',
      referenceNumber: body.referenceNumber ?? null,
      clientName: null,
      stackName: null,
      teamName: null,
      createdAt: now,
    };
    schedules = [created, ...schedules];
    return HttpResponse.json({ status: true, message: '측정계획 등록 성공', data: created }, { status: 201 });
  }),
];
