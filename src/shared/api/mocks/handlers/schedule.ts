import { http, HttpResponse } from 'msw';
import { addDays } from 'date-fns';

import { toDateKey } from '@shared/lib';
import { canTransitionScheduleStatus, type ScheduleStatus } from '@shared/model';

const BASE_URL = 'http://localhost:8080/api';

/**
 * 오늘 기준 상대 날짜(`yyyy-MM-dd`).
 * 목록의 기본 조회 범위가 "오늘"이라 고정 날짜로 두면 개발 시점에 따라 목록이 비어 보인다.
 */
const daysFromToday = (offset: number): string => toDateKey(addDays(new Date(), offset));

type MockSchedule = {
  id: number;
  stackId: number;
  teamId: number;
  measurementField: 'AIR' | 'WATER' | 'NOISE_VIBRATION' | 'ODOR';
  sampledAt: string;              // LocalDateTime
  status: ScheduleStatus;
  referenceNumber: string | null;
  clientName: string | null;
  workplaceName: string | null;
  stackName: string | null;
  teamName: string | null;
  createdAt: string;
};

const now = '2026-07-14T09:00:00';

let schedules: MockSchedule[] = [
  {
    id: 1, stackId: 1, teamId: 1, measurementField: 'AIR', sampledAt: daysFromToday(0),
    status: 'SCHEDULED', referenceNumber: 'KGAR-26-01-001',
    workplaceName: '현대자동차(주) 울산공장', clientName: '현대자동차(주)', stackName: 'stack 172', teamName: '대기측정 1팀', createdAt: now,
  },
  {
    id: 2, stackId: 2, teamId: 2, measurementField: 'AIR', sampledAt: daysFromToday(0),
    status: 'MEASURING', referenceNumber: 'KGAR-26-01-002',
    workplaceName: '현대자동차(주) 울산공장', clientName: '현대자동차(주)', stackName: 'stack 173', teamName: '대기측정 2팀', createdAt: now,
  },
  {
    id: 3, stackId: 3, teamId: 1, measurementField: 'AIR', sampledAt: daysFromToday(-1),
    status: 'ANALYZING', referenceNumber: 'KGAR-26-01-003',
    workplaceName: '현대자동차(주) 울산공장', clientName: '현대자동차(주)', stackName: 'stack 174', teamName: '대기측정 1팀', createdAt: now,
  },
  {
    id: 4, stackId: 4, teamId: 2, measurementField: 'AIR', sampledAt: daysFromToday(-5),
    status: 'COMPLETED', referenceNumber: 'KGAR-26-01-004',
    workplaceName: '현대자동차(주) 울산공장', clientName: '현대자동차(주)', stackName: 'stack 175', teamName: '대기측정 2팀', createdAt: now,
  },
  {
    id: 5, stackId: 5, teamId: 1, measurementField: 'AIR', sampledAt: daysFromToday(-20),
    status: 'CANCELED', referenceNumber: null,
    workplaceName: '현대자동차(주) 울산공장', clientName: '현대자동차(주)', stackName: 'stack 176', teamName: '대기측정 1팀', createdAt: now,
  },
];

// ── 시트 저장소 (계획별 측정 시트 메모리 보관) ─────────────────
const STANDARD_OXYGEN = 4; // 계산 외부 입력 (StackSnapshot.standardOxygen)
const sheetStore: Record<number, unknown[]> = {};

// ── 기본정보 저장소 (PATCH basic-info 로 갱신되는 담당자·일자·채취 시각) ─────────────────
const BASIC_INFO_KEYS = [
  'facilityManager', 'samplingWitness', 'analyst', 'technicalManager',
  'receivedAt', 'analyzedAt', 'issuedAt', 'samplingStartedAt', 'samplingEndedAt',
] as const;

type MockBasicInfo = Partial<Record<(typeof BASIC_INFO_KEYS)[number], string>>;
const basicInfoStore: Record<number, MockBasicInfo> = {};

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
    sampledAt: schedule.sampledAt,
    measurementField: schedule.measurementField,
    ...basicInfoStore[schedule.id],
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
      businessCategory: '화학제품 제조업',
      roadAddress: '경기도 화성시 산단로 5', detailAddress: 'A동', zipcode: '18469', grade: 'TYPE_1',
      stack: {
        stackId: schedule.stackId, field: schedule.measurementField,
        name: schedule.stackName ?? '1호 배출구', semsNumber: '1234567890', grade: 'TYPE_1',
        mainProduct: '합성수지',
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
            preventionId: 1, name: '여과집진기', capacity: 500, unit: 'm³/min',
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
      inspections: [
        { type: 'PRECISION_INSPECTION', enabled: true, cycleMonths: 24, lastInspectedAt: '2025-01-15', nextDueDateOverride: null, notificationEnabled: true },
        { type: 'CALIBRATION', enabled: true, cycleMonths: 12, lastInspectedAt: '2026-01-15', nextDueDateOverride: null, notificationEnabled: true },
        { type: 'GENERAL_TEST', enabled: false, cycleMonths: null, lastInspectedAt: null, nextDueDateOverride: null, notificationEnabled: true },
      ],
      spec: { totalVolume: 1000, orificeDp: 1.84, yd: 0.99 },
    },
    {
      equipmentId: 'eq-gs-1', type: 'GAS_SAMPLER', managementNumber: 'GS-001', serialNumber: 'SN-GS-001',
      modelName: 'APEX-GS', equipmentName: '가스상 채취기', alias: 'GS1', manufacturer: 'Apex',
      inspections: [
        { type: 'PRECISION_INSPECTION', enabled: false, cycleMonths: null, lastInspectedAt: null, nextDueDateOverride: null, notificationEnabled: true },
        { type: 'CALIBRATION', enabled: true, cycleMonths: 12, lastInspectedAt: '2026-01-15', nextDueDateOverride: null, notificationEnabled: true },
        { type: 'GENERAL_TEST', enabled: false, cycleMonths: null, lastInspectedAt: null, nextDueDateOverride: null, notificationEnabled: true },
      ],
      spec: { totalVolume: 800 },
    },
    {
      equipmentId: 'eq-pt-1', type: 'PITOT_TUBE', managementNumber: 'PT-001', serialNumber: 'SN-PT-001',
      modelName: 'S-Type', equipmentName: '피토관', alias: 'PT1', manufacturer: 'Dwyer',
      inspections: [
        { type: 'PRECISION_INSPECTION', enabled: true, cycleMonths: 24, lastInspectedAt: '2026-01-15', nextDueDateOverride: null, notificationEnabled: true },
        { type: 'CALIBRATION', enabled: false, cycleMonths: null, lastInspectedAt: null, nextDueDateOverride: null, notificationEnabled: true },
        { type: 'GENERAL_TEST', enabled: false, cycleMonths: null, lastInspectedAt: null, nextDueDateOverride: null, notificationEnabled: true },
      ],
      spec: { pitotTubeType: 'DUST', coefficients: [{ coefficient: 0.84, velocity: 5 }, { coefficient: 0.85, velocity: 10 }] },
    },
    {
      equipmentId: 'eq-nz-1', type: 'NOZZLE', managementNumber: 'NZ-001', serialNumber: 'SN-NZ-001',
      modelName: 'Nozzle-Set', equipmentName: '노즐', alias: 'NZ1', manufacturer: 'Apex',
      inspections: [
        { type: 'PRECISION_INSPECTION', enabled: false, cycleMonths: null, lastInspectedAt: null, nextDueDateOverride: null, notificationEnabled: true },
        { type: 'CALIBRATION', enabled: false, cycleMonths: null, lastInspectedAt: null, nextDueDateOverride: null, notificationEnabled: true },
        { type: 'GENERAL_TEST', enabled: false, cycleMonths: null, lastInspectedAt: null, nextDueDateOverride: null, notificationEnabled: true },
      ],
      spec: { diameters: [{ diameter: 0.6 }, { diameter: 0.8 }, { diameter: 1.0 }] },
    },
  ],
  items: [
    {
      stackPollutantId: 1, pollutantId: 1, nameKr: '먼지', nameEn: 'Dust', field: schedule.measurementField,
      method: 'DUST', phase: 'PARTICLE', equipment: '입자상 채취기', testMethod: 'ES 01301', cycle: 'QUARTERLY', allowance: 30,
      oxygenApplicable: true,
    },
    {
      stackPollutantId: 2, pollutantId: 2, nameKr: '질소산화물', nameEn: 'NOx', field: schedule.measurementField,
      method: 'FIELD_MEASUREMENT', phase: 'GAS', equipment: '가스분석기', testMethod: 'ES 01310', cycle: 'QUARTERLY', allowance: 150,
      oxygenApplicable: true,
    },
  ],
  sheets: sheetStore[schedule.id] ?? [],
});

const buildScheduleResponse = (schedule: MockSchedule) => ({
  id: schedule.id, tenantId: 1, stackId: schedule.stackId, teamId: schedule.teamId,
  measurementField: schedule.measurementField, sampledAt: schedule.sampledAt,
  status: schedule.status,
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
    const sheets = (body.sheets ?? []).map(computeSheet);
    sheetStore[id] = sheets;

    // 실측값이 처음 저장되는 시점을 측정 착수로 본다(서버 saveSheets 와 동일한 자동 전이).
    // 시트가 하나도 없는 저장(공통 정보만 저장하는 경로)은 착수로 보지 않는다.
    if (sheets.length > 0 && schedule.status === 'SCHEDULED') {
      schedule.status = 'MEASURING';
    }

    return HttpResponse.json({ status: true, message: '측정 데이터 저장 성공', data: buildScheduleResponse(schedule) });
  }),

  // 기본정보 수정 — 시료접수일자가 처음 입력되면 서버처럼 분석 단계로 전진시킨다.
  http.patch(`${BASE_URL}/schedules/:id/basic-info`, async ({ params, request }) => {
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

    const body = (await request.json()) as Record<string, unknown>;
    const previous = basicInfoStore[id] ?? {};
    const merged: MockBasicInfo = { ...previous };

    // null·빈 문자열은 "기존 값 유지" — 서버 SnapshotMerge.keep 규칙과 같다.
    for (const key of BASIC_INFO_KEYS) {
      const value = body[key];
      if (typeof value === 'string' && value !== '') merged[key] = value;
    }
    basicInfoStore[id] = merged;

    if (!previous.receivedAt && merged.receivedAt && schedule.status === 'MEASURING') {
      schedule.status = 'ANALYZING';
    }

    return HttpResponse.json({ status: true, message: '기본정보 수정 성공', data: buildScheduleResponse(schedule) });
  }),

  // 상태 변경 — 전이 규칙은 프론트·서버가 공유한다(허용되지 않는 전이는 400).
  http.patch(`${BASE_URL}/schedules/:id/status`, async ({ params, request }) => {
    const id = Number(params.id);
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) {
      return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
    }

    const { status } = (await request.json()) as { status: ScheduleStatus };
    if (!canTransitionScheduleStatus(schedule.status, status)) {
      return HttpResponse.json(
        { status: false, message: '허용되지 않는 상태 변경입니다.', data: null },
        { status: 400 },
      );
    }
    schedule.status = status;

    return HttpResponse.json({ status: true, message: '측정계획 상태 변경 성공', data: buildScheduleResponse(schedule) });
  }),

  // 등록 (동일 시설·팀·측정일 중복 시 409)
  http.post(`${BASE_URL}/schedules`, async ({ request }) => {
    const body = await request.json() as Partial<MockSchedule>;

    const duplicated = schedules.some(
      (s) => s.stackId === body.stackId
        && s.teamId === body.teamId
        && s.sampledAt === body.sampledAt,
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
      sampledAt: body.sampledAt ?? now,
      status: 'SCHEDULED',
      referenceNumber: body.referenceNumber ?? null,
      workplaceName: null,
      clientName: null,
      stackName: null,
      teamName: null,
      createdAt: now,
    };
    schedules = [created, ...schedules];
    return HttpResponse.json({ status: true, message: '측정계획 등록 성공', data: created }, { status: 201 });
  }),
];
