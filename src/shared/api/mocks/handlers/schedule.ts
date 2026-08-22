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
  workplaceName: string | null;
  stackName: string | null;
  teamName: string | null;
  createdAt: string;
  /** soft delete 시각. null이면 활성 상태다. */
  deletedAt?: string | null;
  deletedBy?: number | null;
  /** 마지막 취소 시각·사유. 서버는 상태 변경 이력에서 뽑지만 목에서는 계획에 직접 붙인다. */
  canceledAt?: string | null;
  cancelReason?: string | null;
};

const now = '2026-07-14T09:00:00';

let schedules: MockSchedule[] = [
  {
    id: 1, stackId: 1, teamId: 1, measurementField: 'AIR', sampledAt: daysFromToday(0),
    status: 'SCHEDULED', schedulePurpose: 'SELF', referenceNumber: 'KGAR-26-01-001',
    workplaceName: '현대자동차(주) 울산공장', clientName: '현대자동차(주)', stackName: 'stack 172', teamName: '대기측정 1팀', createdAt: now,
  },
  {
    id: 2, stackId: 2, teamId: 2, measurementField: 'AIR', sampledAt: daysFromToday(0),
    status: 'MEASURING', schedulePurpose: 'REFERENCE', referenceNumber: 'KGAR-26-01-002',
    workplaceName: '현대자동차(주) 울산공장', clientName: '현대자동차(주)', stackName: 'stack 173', teamName: '대기측정 2팀', createdAt: now,
  },
  {
    id: 3, stackId: 3, teamId: 1, measurementField: 'AIR', sampledAt: daysFromToday(-1),
    status: 'ANALYZING', schedulePurpose: null, referenceNumber: 'KGAR-26-01-003',
    workplaceName: '현대자동차(주) 울산공장', clientName: '현대자동차(주)', stackName: 'stack 174', teamName: '대기측정 1팀', createdAt: now,
  },
  {
    id: 4, stackId: 4, teamId: 2, measurementField: 'AIR', sampledAt: daysFromToday(-5),
    status: 'REPORT_COMPLETED', schedulePurpose: 'SELF', referenceNumber: 'KGAR-26-01-004',
    workplaceName: '현대자동차(주) 울산공장', clientName: '현대자동차(주)', stackName: 'stack 175', teamName: '대기측정 2팀', createdAt: now,
  },
  {
    id: 5, stackId: 5, teamId: 1, measurementField: 'AIR', sampledAt: daysFromToday(-20),
    status: 'CANCELED', schedulePurpose: 'REFERENCE', referenceNumber: null,
    workplaceName: '현대자동차(주) 울산공장', clientName: '현대자동차(주)', stackName: 'stack 176', teamName: '대기측정 1팀', createdAt: now,
    canceledAt: `${daysFromToday(-18)}T10:00:00`, cancelReason: '의뢰기관 요청으로 측정 일정 취소',
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
    schedulePurpose: schedule.schedulePurpose,
    ...basicInfoStore[schedule.id],
  },
  // 측정 시점 고객사(대행업체) 스냅샷 — 성적서 발행이 읽는 값이라 응답에 반드시 담긴다.
  tenant: {
    tenantId: 1,
    name: '(주)엔솔루션환경',
    bizNumber: '1234567890',
    representative: '박대표',
    roadAddress: '경기도 성남시 분당구 판교로 255',
    detailAddress: '3층',
    zipcode: '13486',
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
  items: ITEM_POOL
    .filter((item) => selectedPollutantIds(schedule.id).includes(item.pollutantId))
    // 정정된 조건이 있으면 그 값이 이 회차의 스냅샷이다(원장 ITEM_POOL 은 그대로 둔다).
    .map((item) => ({
      ...item,
      field: schedule.measurementField,
      ...(itemConditionStore[schedule.id]?.[item.pollutantId] ?? {}),
    })),
  sheets: sheetStore[schedule.id] ?? [],
});

const buildScheduleResponse = (schedule: MockSchedule) => ({
  id: schedule.id, tenantId: 1, stackId: schedule.stackId, teamId: schedule.teamId,
  measurementField: schedule.measurementField, sampledAt: schedule.sampledAt,
  schedulePurpose: schedule.schedulePurpose, status: schedule.status,
  referenceNumber: schedule.referenceNumber, createdAt: schedule.createdAt, modifiedAt: schedule.createdAt,
  snapshot: buildSnapshot(schedule),
});

const buildScheduleListResponse = (schedule: MockSchedule) => ({
  ...schedule,
  deletedAt: schedule.deletedAt ?? null,
  deletedBy: schedule.deletedBy ?? null,
  // 서버와 같이 취소 목록에서만 채운다 — 값은 상태 변경 이력의 마지막 취소 건에서 온다.
  canceledAt: null as string | null,
  cancelReason: null as string | null,
});


const buildCanceledScheduleListResponse = (schedule: MockSchedule) => ({
  ...buildScheduleListResponse(schedule),
  canceledAt: schedule.canceledAt ?? null,
  cancelReason: schedule.cancelReason ?? null,
});

export const scheduleHandlers = [
  // 목록 조회 — 삭제(감춤)·취소된 계획은 제외한다.
  http.get(`${BASE_URL}/schedules`, () => {
    const active = schedules
      .filter((s) => !s.deletedAt && s.status !== 'CANCELED')
      .map(buildScheduleListResponse);
    return HttpResponse.json({ status: true, message: '측정계획 목록 조회 성공', data: active });
  }),

  // 취소된 측정계획 목록 — `/schedules/:id` 보다 먼저 등록해야 "canceled"가 id로 잡히지 않는다.
  http.get(`${BASE_URL}/schedules/canceled`, () => {
    const canceled = schedules
      .filter((s) => !s.deletedAt && s.status === 'CANCELED')
      .map(buildCanceledScheduleListResponse);
    return HttpResponse.json({ status: true, message: '취소된 측정계획 목록 조회 성공', data: canceled });
  }),

  // 삭제된 측정계획 목록 (ADMIN) — `/schedules/:id` 보다 먼저 등록해야 "deleted"가 id로 잡히지 않는다.
  http.get(`${BASE_URL}/schedules/deleted`, () => {
    const deleted = schedules.filter((s) => s.deletedAt).map(buildScheduleListResponse);
    return HttpResponse.json({ status: true, message: '삭제된 측정계획 목록 조회 성공', data: deleted });
  }),

  // 상세 조회 (스냅샷 포함)
  http.get(`${BASE_URL}/schedules/:id`, ({ params }) => {
    const id = Number(params.id);
    const schedule = schedules.find((s) => s.id === id && !s.deletedAt);
    if (!schedule) {
      return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    return HttpResponse.json({ status: true, message: '측정계획 상세 조회 성공', data: buildScheduleResponse(schedule) });
  }),

  // 메타 수정 — 관리번호·채취일자·측정용도·측정분야. 서버는 문서 스냅샷의 기본정보도 함께 맞추는데,
  // 목은 buildSnapshot 이 계획 레코드에서 basicInfo 를 조립하므로 레코드만 고치면 같은 결과가 된다.
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

    // null·빈 문자열은 "기존 값 유지" — 서버 Schedule.update 의 keep 규칙과 같다.
    const text = (key: string): string | undefined => {
      const value = body[key];
      return typeof value === 'string' && value !== '' ? value : undefined;
    };

    schedule.referenceNumber = text('referenceNumber') ?? schedule.referenceNumber;
    schedule.sampledAt = text('sampledAt') ?? schedule.sampledAt;

    const purpose = text('schedulePurpose');
    if (purpose === 'SELF' || purpose === 'REFERENCE') schedule.schedulePurpose = purpose;

    const field = text('measurementField');
    if (field === 'AIR' || field === 'WATER' || field === 'NOISE_VIBRATION' || field === 'ODOR') {
      schedule.measurementField = field;
    }

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
    };

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

  // 기본정보 수정 — 시료접수일자가 처음 입력되면 서버처럼 분석 단계로 전진시킨다.
  http.patch(`${BASE_URL}/schedules/:id/basic-info`, async ({ params, request }) => {
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

  // 취소 — 사유 필수. 취소된 계획은 목록에 남는다(삭제와 다르다).
  http.post(`${BASE_URL}/schedules/:id/cancellation`, async ({ params, request }) => {
    const id = Number(params.id);
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) {
      return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
    }

    const { reason } = (await request.json()) as { reason?: string };
    if (!reason?.trim()) {
      return HttpResponse.json(
        { status: false, message: '취소 사유를 입력해 주세요.', data: null },
        { status: 400 },
      );
    }
    if (!canTransitionScheduleStatus(schedule.status, 'CANCELED')) {
      return HttpResponse.json(
        { status: false, message: '허용되지 않는 상태 변경입니다.', data: null },
        { status: 400 },
      );
    }

    schedule.status = 'CANCELED';
    schedule.canceledAt = new Date().toISOString();
    schedule.cancelReason = reason.trim();

    return HttpResponse.json({ status: true, message: '측정계획 취소 성공', data: buildScheduleResponse(schedule) });
  }),

  // 삭제(soft delete) — 실측 데이터가 없는 '측정예정'과 '취소'에서만 허용된다.
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
    schedule.deletedAt = new Date().toISOString();

    return HttpResponse.json({ status: true, message: '측정계획 삭제 성공', data: null });
  }),

  // 재개방 — 완료·취소를 되돌린다. 돌아갈 단계는 저장된 데이터에서 재도출한다.
  http.post(`${BASE_URL}/schedules/:id/reopen`, async ({ params, request }) => {
    const id = Number(params.id);
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) {
      return HttpResponse.json({ status: false, message: '측정계획을 찾을 수 없습니다.', data: null }, { status: 404 });
    }

    const { reason } = (await request.json()) as { reason?: string };
    if (!reason?.trim()) {
      return HttpResponse.json(
        { status: false, message: '재개방 사유를 입력해 주세요.', data: null },
        { status: 400 },
      );
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

  // 복구 (ADMIN)
  http.post(`${BASE_URL}/schedules/:id/restore`, ({ params }) => {
    const id = Number(params.id);
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule?.deletedAt) {
      return HttpResponse.json({ status: false, message: '삭제되지 않은 측정계획은 복구할 수 없습니다.', data: null }, { status: 409 });
    }

    schedule.deletedAt = null;
    return HttpResponse.json({ status: true, message: '측정계획 복구 성공', data: buildScheduleResponse(schedule) });
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
