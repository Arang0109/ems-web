import { http, HttpResponse } from 'msw';
import { addDays } from 'date-fns';

import { toDateKey } from '@shared/lib';
import { MEASUREMENT_CATEGORY_LABEL } from '@shared/config';
import {
  canTransitionScheduleStatus, isTerminalScheduleStatus, canDeleteSchedule, canReopenSchedule,
  type ScheduleStatus, type MeasurementCategory,
} from '@shared/model';

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
  /** 측정용도. 서버가 nullable 이라 미지정이 정상값이다. */
  schedulePurpose: 'SELF' | 'REFERENCE' | null;
  referenceNumber: string | null;
  clientName: string | null;
  stackName: string | null;
  teamName: string | null;
  createdAt: string;
};

const now = '2026-07-14T09:00:00';

let schedules: MockSchedule[] = [
  {
    id: 1, stackId: 1, teamId: 1, measurementField: 'AIR', sampledAt: daysFromToday(0),
    status: 'SCHEDULED', schedulePurpose: 'SELF', referenceNumber: 'KGAR-26-01-001',
    clientName: '현대자동차(주)', stackName: 'stack 172', teamName: '대기측정 1팀', createdAt: now,
  },
  {
    id: 2, stackId: 2, teamId: 2, measurementField: 'AIR', sampledAt: daysFromToday(0),
    status: 'MEASURING', schedulePurpose: 'REFERENCE', referenceNumber: 'KGAR-26-01-002',
    clientName: '현대자동차(주)', stackName: 'stack 173', teamName: '대기측정 2팀', createdAt: now,
  },
  {
    id: 3, stackId: 3, teamId: 1, measurementField: 'AIR', sampledAt: daysFromToday(-1),
    status: 'ANALYZING', schedulePurpose: null, referenceNumber: 'KGAR-26-01-003',
    clientName: '현대자동차(주)', stackName: 'stack 174', teamName: '대기측정 1팀', createdAt: now,
  },
  {
    id: 4, stackId: 4, teamId: 2, measurementField: 'AIR', sampledAt: daysFromToday(-5),
    status: 'REPORT_COMPLETED', schedulePurpose: 'SELF', referenceNumber: 'KGAR-26-01-004',
    clientName: '현대자동차(주)', stackName: 'stack 175', teamName: '대기측정 2팀', createdAt: now,
  },
  {
    id: 5, stackId: 5, teamId: 1, measurementField: 'AIR', sampledAt: daysFromToday(-20),
    status: 'CANCELED', schedulePurpose: 'REFERENCE', referenceNumber: null,
    clientName: '현대자동차(주)', stackName: 'stack 176', teamName: '대기측정 1팀', createdAt: now,
  },
];

// ── 시트 저장소 (계획별 측정 시트 메모리 보관) ─────────────────
const STANDARD_OXYGEN = 4; // 계산 외부 입력 (StackSnapshot.standardOxygen)
const sheetStore: Record<number, unknown[]> = {};

// ── 기본정보 저장소 ────────────────────────────────────────────
// 값의 주인이 갈려 저장 경로도 갈린다 — 채취 시각·현장 담당자는 PUT /sheets,
// 서명란 담당자는 PATCH /tenant, 측정자 표기는 PATCH /team 이다.
// 일자 셋은 메타(schedule) 소유이고 PATCH /report-dates 가 전체 채택으로 다룬다 —
// 부분 갱신인 나머지와 규칙이 다르므로 키 묶음을 나눠 둔다. 저장소는 하나로 공유한다.
const SAMPLING_INFO_KEYS = [
  'samplingStartedAt', 'samplingEndedAt', 'facilityManager', 'samplingWitness',
] as const;
const TENANT_STAFF_KEYS = ['analyst', 'technicalManager'] as const;
const TEAM_MEMBER_KEYS = ['mentorName', 'menteeName'] as const;
const REPORT_DATE_KEYS = ['receivedAt', 'analyzedAt', 'issuedAt'] as const;

type BasicInfoKey =
  | (typeof SAMPLING_INFO_KEYS)[number]
  | (typeof TENANT_STAFF_KEYS)[number]
  | (typeof TEAM_MEMBER_KEYS)[number]
  | (typeof REPORT_DATE_KEYS)[number];

type MockBasicInfo = Partial<Record<BasicInfoKey, string>>;
const basicInfoStore: Record<number, MockBasicInfo> = {};

/**
 * 부분 갱신 경로의 공통 처리 — null·빈 문자열은 "기존 값 유지"다(서버 SnapshotMerge.keep 규칙).
 * 자기 소유 키만 훑으므로 다른 화면이 넣은 값을 덮어쓰지 않는다.
 */
const patchBasicInfo = async (
  rawId: string | readonly string[] | undefined,
  request: Request,
  keys: readonly BasicInfoKey[],
  message: string,
) => {
  const id = Number(rawId);
  const schedule = schedules.find((s) => s.id === id);
  if (!schedule) {
    return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
  }
  if (isTerminalScheduleStatus(schedule.status)) {
    return HttpResponse.json(
      { status: false, message: '성적서 작성이 완료되었거나 취소된 측정계획은 수정할 수 없습니다.', data: null },
      { status: 409 },
    );
  }

  const body = (await request.json()) as Record<string, unknown>;
  const merged: MockBasicInfo = { ...(basicInfoStore[id] ?? {}) };
  for (const key of keys) {
    const value = body[key];
    if (typeof value === 'string' && value !== '') merged[key] = value;
  }
  basicInfoStore[id] = merged;

  return HttpResponse.json({ status: true, message, data: buildScheduleResponse(schedule) });
};

// 측정항목 스냅샷 풀 — stack-pollutant 핸들러의 stackId 1 목록과 pollutantId 를 맞춘다.
// 서버는 측정시설 원장에서 선택된 물질만 스냅샷에 담으므로, 여기서도 풀을 걸러 만든다.
const ITEM_POOL = [
  { stackPollutantId: 101, pollutantId: 1, code: 'TSP', nameKr: '먼지', nameEn: 'Dust', method: 'DUST', phase: 'PARTICLE', equipment: '입자상 채취기', testMethod: 'ES 01301', cycle: 'QUARTERLY', allowance: 30, oxygenApplicable: true },
  { stackPollutantId: 102, pollutantId: 2, code: 'NOX', nameKr: '질소산화물', nameEn: 'NOx', method: 'FIELD_MEASUREMENT', phase: 'GAS', equipment: '가스분석기', testMethod: 'ES 01310', cycle: 'QUARTERLY', allowance: 150, oxygenApplicable: true },
  { stackPollutantId: 103, pollutantId: 3, code: 'SOX', nameKr: '황산화물', nameEn: 'SOx', method: 'FIELD_MEASUREMENT', phase: 'GAS', equipment: '가스분석기', testMethod: 'ES 01312', cycle: 'QUARTERLY', allowance: 180, oxygenApplicable: true },
  { stackPollutantId: 104, pollutantId: 4, code: 'HCL', nameKr: '염화수소', nameEn: 'HCl', method: 'ABSORPTION', phase: 'GAS', equipment: '흡수액 채취기', testMethod: 'ES 01303', cycle: 'MONTHLY', allowance: 10, oxygenApplicable: false },
  { stackPollutantId: 105, pollutantId: 5, code: 'CO', nameKr: '일산화탄소', nameEn: 'CO', method: 'FIELD_MEASUREMENT', phase: 'GAS', equipment: '가스분석기', testMethod: 'ES 01311', cycle: 'MONTHLY', allowance: 200, oxygenApplicable: false },
  { stackPollutantId: 106, pollutantId: 11, code: 'NH3', nameKr: '암모니아', nameEn: 'NH3', method: 'ABSORPTION', phase: 'GAS', equipment: '흡수액 채취기', testMethod: 'ES 01304', cycle: 'ANNUAL', allowance: 30, oxygenApplicable: false },
];

// 계획별로 선택된 측정물질 id. 등록 시 고른 항목을 흉내 낸 기본값이다.
const itemsStore: Record<number, number[]> = {};
const selectedPollutantIds = (scheduleId: number): number[] => itemsStore[scheduleId] ?? [1, 2];

// 계획별로 정정된 측정 조건. 스냅샷이 원장 사본이라는 성질을 흉내 내려면 원장(ITEM_POOL)이
// 아니라 계획 쪽에 얹혀 있어야 한다 — 정정은 그 회차 문서에만 남는다.
type ItemCondition = { cycle: string; allowance: number | null; oxygenApplicable: boolean };
const itemConditionStore: Record<number, Record<number, ItemCondition>> = {};

/**
 * 저장된 측정 데이터에서 진행 단계를 재도출한다(서버 `ScheduleProgress` 와 같은 규칙).
 * 재개방이 어느 단계로 돌아갈지 정하는 데 쓴다.
 */
const deriveProgress = (scheduleId: number): ScheduleStatus => {
  const basicInfo = basicInfoStore[scheduleId] ?? {};
  if (basicInfo.receivedAt) return 'ANALYZING';
  if (basicInfo.samplingStartedAt || (sheetStore[scheduleId]?.length ?? 0) > 0) return 'MEASURING';
  return 'SCHEDULED';
};

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
// 계산에 사용하는 필드만 명시한 느슨한 시트 형태(나머지는 그대로 통과).
interface LooseSheet {
  category?: MeasurementCategory;
  version?: number | null;
  samplingPoints?: { gasTemperature?: number; dynamicPressure?: number; staticPressure?: number }[];
  weather?: { atmosphericPressure?: number; atmosphericPressureMmHg?: number | null };
  flowRate?: Record<string, unknown> | null;
  exhaustGas?: { o2Concentration?: number[]; o2CorrectionFactor?: number | null };
  [key: string]: unknown;
}

// 서버 SheetCalculator의 핵심만 흉내낸다 (유량 집계·대기압·산소보정계수).
const computeSheet = (sheet: LooseSheet): LooseSheet => {
  const points = sheet.samplingPoints ?? [];
  const averageGasTemperatureKelvin = avg(
    points.map((p) => (typeof p.gasTemperature === 'number' ? p.gasTemperature + 273 : null)));
  const averageDynamicPressure = avg(points.map((p) => p.dynamicPressure));
  const averageStaticPressure = avg(points.map((p) => p.staticPressure));

  const hpa = sheet.weather?.atmosphericPressure;
  const atmosphericPressureMmHg = typeof hpa === 'number' ? round((hpa * 760) / 1013.25, 2) : null;

  const o2Avg = avg(sheet.exhaustGas?.o2Concentration ?? []);
  const o2CorrectionFactor =
    o2Avg != null && 21 - o2Avg !== 0 ? round((21 - STANDARD_OXYGEN) / (21 - o2Avg), 5) : null;

  return {
    ...sheet,
    weather: { ...sheet.weather, atmosphericPressureMmHg },
    exhaustGas: { ...sheet.exhaustGas, o2CorrectionFactor },
    flowRate: {
      ...sheet.flowRate,
      averageGasTemperatureKelvin, averageDynamicPressure, averageStaticPressure,
    },
  };
};

// 측정계획 상세 스냅샷 구성 (표시·계산 검증에 필요한 최소 트리).
// 문서의 저장 메타(id·scheduleId·tenantId·status)는 서버 응답에 담기지 않는다 — 최상위 메타가 진실의 원천이다.
const buildSnapshot = (schedule: MockSchedule) => ({
  // 측정 시점 고객사(대행업체) 스냅샷 — 성적서 서명란 담당자를 여기서 읽는다.
  tenant: {
    tenantId: 1,
    name: '(주)엔솔루션환경',
    bizNumber: '1234567890',
    representative: '박대표',
    roadAddress: '경기도 성남시 분당구 판교로 255',
    detailAddress: '3층',
    zipcode: '13486',
    analyst: basicInfoStore[schedule.id]?.analyst ?? '',
    technicalManager: basicInfoStore[schedule.id]?.technicalManager ?? '',
  },
  team: {
    teamId: schedule.teamId, teamName: schedule.teamName ?? '측정팀',
    mentorName: basicInfoStore[schedule.id]?.mentorName ?? '김사수',
    menteeName: basicInfoStore[schedule.id]?.menteeName ?? '이부사수',
    equipments: EQUIPMENT_SNAPSHOTS,
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
  // 그 회차의 현장 채취 사실 — 채취 시각·현장 담당자·채취 기록지를 함께 담는다.
  samplingData: {
    samplingStartedAt: basicInfoStore[schedule.id]?.samplingStartedAt ?? null,
    samplingEndedAt: basicInfoStore[schedule.id]?.samplingEndedAt ?? null,
    facilityManager: basicInfoStore[schedule.id]?.facilityManager ?? null,
    samplingWitness: basicInfoStore[schedule.id]?.samplingWitness ?? null,
    sheets: sheetStore[schedule.id] ?? [],
  },
  items: ITEM_POOL
    .filter((item) => selectedPollutantIds(schedule.id).includes(item.pollutantId))
    // 정정된 조건이 있으면 그 값이 이 회차의 스냅샷이다(원장 ITEM_POOL 은 그대로 둔다).
    .map((item) => ({
      ...item,
      field: schedule.measurementField,
      ...(itemConditionStore[schedule.id]?.[item.pollutantId] ?? {}),
      // 실험분석 결과는 항목 안에 있다. 아직 분석 전이면 null 이며 정상 상태다.
      analysis: null,
    })),
});

// 팀 스냅샷이 품는 이 회차의 장비. 서버가 유형별 슬롯 대신 목록 하나로 관리한다.
const EQUIPMENT_SNAPSHOTS = [
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
];

// 성적서 기본정보는 전부 최상위에 있다 — 스냅샷에는 사본을 두지 않는다.
const buildScheduleResponse = (schedule: MockSchedule) => ({
  id: schedule.id, tenantId: 1, stackId: schedule.stackId, teamId: schedule.teamId,
  measurementField: schedule.measurementField, sampledAt: schedule.sampledAt,
  receivedAt: basicInfoStore[schedule.id]?.receivedAt ?? null,
  analyzedAt: basicInfoStore[schedule.id]?.analyzedAt ?? null,
  issuedAt: basicInfoStore[schedule.id]?.issuedAt ?? null,
  schedulePurpose: schedule.schedulePurpose, status: schedule.status,
  referenceNumber: schedule.referenceNumber, createdAt: schedule.createdAt, modifiedAt: schedule.createdAt,
  snapshot: buildSnapshot(schedule),
});

const buildScheduleListResponse = (schedule: MockSchedule) => ({ ...schedule });

export const scheduleHandlers = [
  // 목록 조회 — 취소된 계획은 제외한다.
  http.get(`${BASE_URL}/schedules`, () => {
    const active = schedules
      .filter((s) => s.status !== 'CANCELED')
      .map(buildScheduleListResponse);
    return HttpResponse.json({ status: true, message: '측정계획 목록 조회 성공', data: active });
  }),

  // 취소된 측정계획 목록 — `/schedules/:id` 보다 먼저 등록해야 "canceled"가 id로 잡히지 않는다.
  http.get(`${BASE_URL}/schedules/canceled`, () => {
    const canceled = schedules
      .filter((s) => s.status === 'CANCELED')
      .map(buildScheduleListResponse);
    return HttpResponse.json({ status: true, message: '취소된 측정계획 목록 조회 성공', data: canceled });
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

  // 계획 정의 수정 — 채취일자·측정용도·관리번호. 측정분야와 측정 대상은 생성 시점에만 정한다.
  // (구체적 경로가 먼저 잡히도록 /schedules/:id/sheets 뒤에 둔다.)
  http.put(`${BASE_URL}/schedules/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) {
      return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    if (isTerminalScheduleStatus(schedule.status)) {
      return HttpResponse.json(
        { status: false, message: '성적서 작성이 완료되었거나 취소된 측정계획은 수정할 수 없습니다.', data: null },
        { status: 409 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    // 전달한 값을 그대로 채택한다 — 빈 값은 기존 값을 지운다(스냅샷 경로의 부분 갱신과 규칙이 다르다).
    const text = (key: string): string | null => {
      const value = body[key];
      return typeof value === 'string' && value !== '' ? value : null;
    };

    // 채취일자는 측정 건수 집계의 기준일이라 서버가 비우지 못하게 막는다.
    const sampledAt = text('sampledAt');
    if (!sampledAt) {
      return HttpResponse.json(
        { status: false, message: '채취일자는 필수 값입니다.', data: null },
        { status: 400 },
      );
    }

    schedule.sampledAt = sampledAt;
    schedule.referenceNumber = text('referenceNumber');

    const purpose = text('schedulePurpose');
    schedule.schedulePurpose = purpose === 'SELF' || purpose === 'REFERENCE' ? purpose : null;

    return HttpResponse.json({ status: true, message: '측정계획 수정 성공', data: buildScheduleResponse(schedule) });
  }),

  // 측정 시트 저장 (서버 계산 흉내 후 저장)
  http.put(`${BASE_URL}/schedules/:id/sheets`, async ({ params, request }) => {
    const id = Number(params.id);
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) {
      return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    if (isTerminalScheduleStatus(schedule.status)) {
      return HttpResponse.json(
        { status: false, message: '성적서 작성이 완료되었거나 취소된 측정계획은 수정할 수 없습니다.', data: null },
        { status: 409 },
      );
    }

    const body = (await request.json()) as {
      sheets: LooseSheet[];
      deletedSheets?: { category?: MeasurementCategory; version?: number | null }[];
    } & Record<string, unknown>;

    // 채취 시각·현장 담당자는 같은 스냅샷 노드에 살아 이 요청에 함께 실린다(부분 갱신).
    const samplingInfo: MockBasicInfo = { ...(basicInfoStore[id] ?? {}) };
    for (const key of SAMPLING_INFO_KEYS) {
      const value = body[key];
      if (typeof value === 'string' && value !== '') samplingInfo[key] = value;
    }
    basicInfoStore[id] = samplingInfo;

    // 서버 SheetMerge 와 같은 규칙 — category 를 자연키로 삼아 요청에 담긴 시트만 교체하고,
    // 요청에 없는 시트는 보관본을 유지한다(다른 사용자가 방금 추가한 시트를 지우지 않기 위함).
    const current = (sheetStore[id] ?? []) as LooseSheet[];
    const currentByCategory = new Map(current.map((sheet) => [sheet.category, sheet]));
    const incoming = body.sheets ?? [];
    const deleted = body.deletedSheets ?? [];

    const isStale = (category: MeasurementCategory | undefined, version: number | null | undefined) => {
      const latest = category === undefined ? undefined : currentByCategory.get(category);
      if (!latest || latest.version === null || latest.version === undefined) return false;
      return latest.version !== version;
    };

    const conflicted = [
      ...incoming.filter((sheet) => isStale(sheet.category, sheet.version)),
      ...deleted.filter((ref) => isStale(ref.category, ref.version)),
    ].map((sheet) => MEASUREMENT_CATEGORY_LABEL[sheet.category as MeasurementCategory]);

    if (conflicted.length > 0) {
      return HttpResponse.json(
        {
          status: false,
          message: `다른 사용자가 ${[...new Set(conflicted)].join('·')} 측정 데이터를 먼저 저장했습니다.`
            + ' 최신 내용을 불러온 뒤 다시 저장해 주세요.',
          data: null,
        },
        { status: 409 },
      );
    }

    const merged = new Map(currentByCategory);
    deleted.forEach((ref) => ref.category !== undefined && merged.delete(ref.category));
    incoming.forEach((sheet) => {
      const previous = currentByCategory.get(sheet.category);
      const version = previous?.version == null ? 0 : previous.version + 1;
      merged.set(sheet.category, computeSheet({ ...sheet, version }));
    });

    const sheets = [...merged.values()];
    sheetStore[id] = sheets;

    // 실측값이 처음 저장되는 시점을 측정 착수로 본다(서버 saveSheets 와 동일한 자동 전이).
    // 시트가 하나도 없는 저장(공통 정보만 저장하는 경로)은 착수로 보지 않는다.
    if (sheets.length > 0 && schedule.status === 'SCHEDULED') {
      schedule.status = 'MEASURING';
    }

    return HttpResponse.json({ status: true, message: '측정 데이터 저장 성공', data: buildScheduleResponse(schedule) });
  }),

  // 측정항목 교체 — 전달 목록으로 전체 교체한다(부분 수정이 아니다).
  http.patch(`${BASE_URL}/schedules/:id/items`, async ({ params, request }) => {
    const id = Number(params.id);
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) {
      return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    if (isTerminalScheduleStatus(schedule.status)) {
      return HttpResponse.json(
        { status: false, message: '성적서 작성이 완료되었거나 취소된 측정계획은 수정할 수 없습니다.', data: null },
        { status: 409 },
      );
    }

    const body = (await request.json()) as { pollutantIds?: number[] };
    const pollutantIds = body.pollutantIds ?? [];
    if (pollutantIds.length === 0) {
      return HttpResponse.json(
        { status: false, message: '측정 항목은 하나 이상 선택해야 합니다.', data: null },
        { status: 400 },
      );
    }

    // 서버는 이미 포함돼 있던 항목이면 원장에서 빠졌어도 스냅샷 값을 유지한다.
    const kept = selectedPollutantIds(id);
    const unknown = pollutantIds.filter(
      (pollutantId) => !kept.includes(pollutantId)
        && !ITEM_POOL.some((item) => item.pollutantId === pollutantId),
    );
    if (unknown.length > 0) {
      return HttpResponse.json(
        { status: false, message: '측정시설에 등록되지 않은 측정항목입니다.', data: null },
        { status: 400 },
      );
    }

    itemsStore[id] = [...new Set(pollutantIds)];

    return HttpResponse.json({ status: true, message: '측정항목 수정 성공', data: buildScheduleResponse(schedule) });
  }),

  // 측정항목 정정 — 이 회차 문서에 담긴 항목 하나의 측정 조건만 바로잡는다.
  // 원장(stack-pollutant)은 건드리지 않으므로, 화면이 원장까지 고치려면 그 API를 따로 부른다.
  http.patch(`${BASE_URL}/schedules/:id/items/:pollutantId`, async ({ params, request }) => {
    const id = Number(params.id);
    const pollutantId = Number(params.pollutantId);
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) {
      return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    if (isTerminalScheduleStatus(schedule.status)) {
      return HttpResponse.json(
        { status: false, message: '성적서 작성이 완료되었거나 취소된 측정계획은 수정할 수 없습니다.', data: null },
        { status: 409 },
      );
    }
    if (!selectedPollutantIds(id).includes(pollutantId)) {
      return HttpResponse.json(
        { status: false, message: '이번 측정계획의 측정항목이 아닙니다.', data: null },
        { status: 400 },
      );
    }

    const body = (await request.json()) as Partial<ItemCondition>;
    if (!body.cycle) {
      return HttpResponse.json(
        { status: false, message: '측정주기는 필수입니다.', data: null },
        { status: 400 },
      );
    }

    itemConditionStore[id] = {
      ...itemConditionStore[id],
      [pollutantId]: {
        cycle: body.cycle,
        allowance: body.allowance ?? null,
        oxygenApplicable: Boolean(body.oxygenApplicable),
      },
    };

    return HttpResponse.json({ status: true, message: '측정항목 정정 성공', data: buildScheduleResponse(schedule) });
  }),

  // 성적서 진행 일자 수정 — 실험·분석 탭이 단독으로 소유하므로 전체 채택이다.
  // 빈 값은 지우며, 시료접수일자가 처음 입력되면 서버처럼 분석 단계로 전진시킨다.
  http.patch(`${BASE_URL}/schedules/:id/report-dates`, async ({ params, request }) => {
    const id = Number(params.id);
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) {
      return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    if (isTerminalScheduleStatus(schedule.status)) {
      return HttpResponse.json(
        { status: false, message: '성적서 작성이 완료되었거나 취소된 측정계획은 수정할 수 없습니다.', data: null },
        { status: 409 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const previous = basicInfoStore[id] ?? {};
    const merged: MockBasicInfo = { ...previous };

    // 전체 채택 — 전달한 값을 그대로 쓰고 빈 값은 지운다.
    for (const key of REPORT_DATE_KEYS) {
      const value = body[key];
      if (typeof value === 'string' && value !== '') merged[key] = value;
      else delete merged[key];
    }

    // 서버 requireChronological 과 같은 규칙 — 빈 칸은 건너뛰되 사슬은 끊지 않는다.
    const chain = [schedule.sampledAt, merged.receivedAt, merged.analyzedAt, merged.issuedAt]
      .filter((date): date is string => Boolean(date));
    if (chain.some((date, i) => i > 0 && date < chain[i - 1])) {
      return HttpResponse.json(
        { status: false, message: '보고서 진행 일자의 순서가 올바르지 않습니다', data: null },
        { status: 400 },
      );
    }

    basicInfoStore[id] = merged;

    if (!previous.receivedAt && merged.receivedAt && schedule.status === 'MEASURING') {
      schedule.status = 'ANALYZING';
    }

    return HttpResponse.json({ status: true, message: '성적서 진행 일자 수정 성공', data: buildScheduleResponse(schedule) });
  }),

  // 고객사 스냅샷 수정 — 서명란 담당자를 두 탭이 공유하므로 부분 갱신이다.
  http.patch(`${BASE_URL}/schedules/:id/tenant`, async ({ params, request }) =>
    patchBasicInfo(params.id, request, TENANT_STAFF_KEYS, '고객사 스냅샷 수정 성공')),

  // 측정팀 스냅샷 수정 — 이 회차 측정자 표기만 바꾼다.
  http.patch(`${BASE_URL}/schedules/:id/team`, async ({ params, request }) =>
    patchBasicInfo(params.id, request, TEAM_MEMBER_KEYS, '측정팀 스냅샷 수정 성공')),

  // 성적서 작성 완료 확정 — 전이 규칙은 프론트·서버가 공유한다(허용되지 않는 전이는 400).
  http.post(`${BASE_URL}/schedules/:id/completion`, ({ params }) => {
    const id = Number(params.id);
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) {
      return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
    }

    if (!canTransitionScheduleStatus(schedule.status, 'REPORT_COMPLETED')) {
      return HttpResponse.json(
        { status: false, message: '허용되지 않는 상태 변경입니다.', data: null },
        { status: 400 },
      );
    }
    schedule.status = 'REPORT_COMPLETED';

    return HttpResponse.json({ status: true, message: '측정계획 성적서 작성 완료 처리 성공', data: buildScheduleResponse(schedule) });
  }),

  // 취소 — 취소된 계획은 목록에 남는다(삭제와 다르다).
  http.post(`${BASE_URL}/schedules/:id/cancellation`, ({ params }) => {
    const id = Number(params.id);
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) {
      return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
    }

    if (!canTransitionScheduleStatus(schedule.status, 'CANCELED')) {
      return HttpResponse.json(
        { status: false, message: '허용되지 않는 상태 변경입니다.', data: null },
        { status: 400 },
      );
    }

    schedule.status = 'CANCELED';

    return HttpResponse.json({ status: true, message: '측정계획 취소 성공', data: buildScheduleResponse(schedule) });
  }),

  // 삭제(물리 삭제) — 실측 데이터가 없는 '측정예정'과 '취소'에서만 허용되며 되돌릴 수 없다.
  http.delete(`${BASE_URL}/schedules/:id`, ({ params }) => {
    const id = Number(params.id);
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) {
      return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
    }

    if (!canDeleteSchedule(schedule.status)) {
      return HttpResponse.json(
        { status: false, message: '진행 중인 측정계획은 삭제할 수 없습니다. 취소를 사용해 주세요.', data: null },
        { status: 409 },
      );
    }
    // 서버는 메타·세부 문서·실험분석정보를 함께 지운다. 목에서는 계획과 시트를 지운다.
    schedules = schedules.filter((s) => s.id !== id);
    delete sheetStore[id];

    return HttpResponse.json({ status: true, message: '측정계획 삭제 성공', data: null });
  }),

  // 재개방 — 완료·취소를 되돌린다. 돌아갈 단계는 저장된 데이터에서 재도출한다.
  http.post(`${BASE_URL}/schedules/:id/reopen`, ({ params }) => {
    const id = Number(params.id);
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) {
      return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
    }

    if (!canReopenSchedule(schedule.status)) {
      return HttpResponse.json(
        { status: false, message: '완료되었거나 취소된 측정계획만 재개방할 수 있습니다.', data: null },
        { status: 409 },
      );
    }

    schedule.status = deriveProgress(schedule.id);

    return HttpResponse.json({ status: true, message: '측정계획 재개방 성공', data: buildScheduleResponse(schedule) });
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
      schedulePurpose: body.schedulePurpose ?? null,
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
