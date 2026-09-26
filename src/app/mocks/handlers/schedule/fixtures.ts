// 측정계획 목 — 분할 전 `handlers/schedule.ts` 의 한 조각. 조립은 `./index.ts`.
import { addDays } from 'date-fns';

import { toDateKey } from '@shared/lib';
import type { ScheduleStatus } from '@shared/model';

export const STANDARD_OXYGEN = 4; // 계산 외부 입력 (StackSnapshot.standardOxygen)

/**
 * 오늘 기준 상대 날짜(`yyyy-MM-dd`).
 * 목록의 기본 조회 범위가 "오늘"이라 고정 날짜로 두면 개발 시점에 따라 목록이 비어 보인다.
 */
export const daysFromToday = (offset: number): string => toDateKey(addDays(new Date(), offset));

export type MockSchedule = {
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

export const now = '2026-07-14T09:00:00';

export const db: { schedules: MockSchedule[] } = {
  schedules: [
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
],
};

// 측정항목 스냅샷 풀 — stack-pollutant 핸들러의 stackId 1 목록과 pollutantId 를 맞춘다.
// 서버는 측정시설 원장에서 선택된 물질만 스냅샷에 담으므로, 여기서도 풀을 걸러 만든다.
// `method` 는 측정방법 사본이다 — measurement-method 핸들러의 기본 8종(id 1~8)과 값을 맞춘다.
// `samplingMinutes` 는 항목에 적용된 채취시간(오버라이드 반영) — 염화수소만 흡수액 표준 40분 대신 항목별 60분이다.
export const ITEM_POOL = [
  { stackPollutantId: 101, pollutantId: 1, code: 'TSP', nameKr: '먼지', nameEn: 'Dust', method: { methodId: 1, name: '먼지', sampleGrouping: 'NONE', mergedSampleName: null, samplingMinutes: null }, phase: 'PARTICLE', mode: 'DUST', equipment: '입자상 채취기', testMethod: 'ES 01301', samplingMinutes: null, cycle: 'QUARTERLY', allowance: 30, oxygenApplicable: true },
  { stackPollutantId: 102, pollutantId: 2, code: 'NOX', nameKr: '질소산화물', nameEn: 'NOx', method: { methodId: 4, name: '현장측정', sampleGrouping: 'NONE', mergedSampleName: null, samplingMinutes: null }, phase: 'GAS', mode: 'DIRECT_READING', equipment: '가스분석기', testMethod: 'ES 01310', samplingMinutes: null, cycle: 'QUARTERLY', allowance: 150, oxygenApplicable: true },
  { stackPollutantId: 103, pollutantId: 3, code: 'SOX', nameKr: '황산화물', nameEn: 'SOx', method: { methodId: 4, name: '현장측정', sampleGrouping: 'NONE', mergedSampleName: null, samplingMinutes: null }, phase: 'GAS', mode: 'DIRECT_READING', equipment: '가스분석기', testMethod: 'ES 01312', samplingMinutes: null, cycle: 'QUARTERLY', allowance: 180, oxygenApplicable: true },
  { stackPollutantId: 104, pollutantId: 4, code: 'HCL', nameKr: '염화수소', nameEn: 'HCl', method: { methodId: 5, name: '흡수액', sampleGrouping: 'PER_ITEM', mergedSampleName: null, samplingMinutes: 40 }, phase: 'GAS', mode: 'GAS_SAMPLING', equipment: '흡수액 채취기', testMethod: 'ES 01303', samplingMinutes: 60, cycle: 'MONTHLY', allowance: 10, oxygenApplicable: false },
  { stackPollutantId: 105, pollutantId: 5, code: 'CO', nameKr: '일산화탄소', nameEn: 'CO', method: { methodId: 4, name: '현장측정', sampleGrouping: 'NONE', mergedSampleName: null, samplingMinutes: null }, phase: 'GAS', mode: 'DIRECT_READING', equipment: '가스분석기', testMethod: 'ES 01311', samplingMinutes: null, cycle: 'MONTHLY', allowance: 200, oxygenApplicable: false },
  { stackPollutantId: 106, pollutantId: 11, code: 'NH3', nameKr: '암모니아', nameEn: 'NH3', method: { methodId: 5, name: '흡수액', sampleGrouping: 'PER_ITEM', mergedSampleName: null, samplingMinutes: 40 }, phase: 'GAS', mode: 'GAS_SAMPLING', equipment: '흡수액 채취기', testMethod: 'ES 01304', samplingMinutes: 40, cycle: 'ANNUAL', allowance: 30, oxygenApplicable: false },
  // 현장채취 가스상 표의 자동 채움 규칙을 화면에서 볼 수 있게 채취 방법별 항목을 둔다.
  // 흡착관 2종 → VOCs-T 한 행, 카트리지 2종 → VOCs 한 행, 테드라백 → 항목별 행.
  { stackPollutantId: 107, pollutantId: 21, code: 'BENZENE', nameKr: '벤젠', nameEn: 'Benzene', method: { methodId: 6, name: '흡착관', sampleGrouping: 'MERGED', mergedSampleName: 'VOCs-T', samplingMinutes: 30 }, phase: 'GAS', mode: 'GAS_SAMPLING', equipment: '흡착관 채취기', testMethod: 'ES 01802', samplingMinutes: 30, cycle: 'SEMI_ANNUAL', allowance: 10, oxygenApplicable: false },
  { stackPollutantId: 108, pollutantId: 22, code: 'TOLUENE', nameKr: '톨루엔', nameEn: 'Toluene', method: { methodId: 6, name: '흡착관', sampleGrouping: 'MERGED', mergedSampleName: 'VOCs-T', samplingMinutes: 30 }, phase: 'GAS', mode: 'GAS_SAMPLING', equipment: '흡착관 채취기', testMethod: 'ES 01802', samplingMinutes: 30, cycle: 'SEMI_ANNUAL', allowance: 60, oxygenApplicable: false },
  { stackPollutantId: 109, pollutantId: 23, code: 'HCHO', nameKr: '포름알데히드', nameEn: 'Formaldehyde', method: { methodId: 8, name: '카트리지', sampleGrouping: 'MERGED', mergedSampleName: 'VOCs', samplingMinutes: 30 }, phase: 'GAS', mode: 'GAS_SAMPLING', equipment: '카트리지 채취기', testMethod: 'ES 01805', samplingMinutes: 30, cycle: 'SEMI_ANNUAL', allowance: 10, oxygenApplicable: false },
  { stackPollutantId: 110, pollutantId: 24, code: 'CH3CHO', nameKr: '아세트알데히드', nameEn: 'Acetaldehyde', method: { methodId: 8, name: '카트리지', sampleGrouping: 'MERGED', mergedSampleName: 'VOCs', samplingMinutes: 30 }, phase: 'GAS', mode: 'GAS_SAMPLING', equipment: '카트리지 채취기', testMethod: 'ES 01805', samplingMinutes: 30, cycle: 'SEMI_ANNUAL', allowance: 10, oxygenApplicable: false },
  { stackPollutantId: 111, pollutantId: 25, code: 'DMDS', nameKr: '이황화메틸', nameEn: 'Dimethyl disulfide', method: { methodId: 7, name: '테드라백', sampleGrouping: 'PER_ITEM', mergedSampleName: null, samplingMinutes: null }, phase: 'GAS', mode: 'GAS_SAMPLING', equipment: '테드라백', testMethod: 'ES 09305', samplingMinutes: null, cycle: 'SEMI_ANNUAL', allowance: null, oxygenApplicable: false },
  // 비소화합물은 입자상(중금속 여지)이면서 흡수액도 한다 — 이 고객사는 흡수액(항목별 채취) 측정방법을 붙여 가스상 행이 생긴다.
  // phase 는 규칙에 쓰이지 않으므로 정직하게 PARTICLE 이고, 분류(mode)는 주 방식인 중금속이다.
  { stackPollutantId: 112, pollutantId: 26, code: 'AS', nameKr: '비소화합물', nameEn: 'Arsenic compounds', method: { methodId: 5, name: '흡수액', sampleGrouping: 'PER_ITEM', mergedSampleName: null, samplingMinutes: 40 }, phase: 'PARTICLE', mode: 'HEAVY_METAL', equipment: '입자상 채취기', testMethod: 'ES 01400', samplingMinutes: 40, cycle: 'ANNUAL', allowance: 2, oxygenApplicable: false },
];

// 팀 스냅샷이 품는 이 회차의 장비. 서버가 유형별 슬롯 대신 목록 하나로 관리한다.
export const EQUIPMENT_SNAPSHOTS = [
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

