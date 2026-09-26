// 측정계획 목 — 분할 전 `handlers/schedule.ts` 의 한 조각. 조립은 `./index.ts`.
import { EQUIPMENT_SNAPSHOTS, ITEM_POOL, STANDARD_OXYGEN, type MockSchedule } from './fixtures';
import {
  basicInfoStore, customFieldValueStore, itemConditionStore, selectedPollutantIds, sheetStore,
} from './store';

// 측정계획 상세 스냅샷 구성 (표시·계산 검증에 필요한 최소 트리).
// 문서의 저장 메타(id·scheduleId·tenantId·status)는 서버 응답에 담기지 않는다 — 최상위 메타가 진실의 원천이다.
export const buildSnapshot = (schedule: MockSchedule) => ({
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
  customFields: customFieldValueStore[schedule.id] ?? null,
});

// 성적서 기본정보는 전부 최상위에 있다 — 스냅샷에는 사본을 두지 않는다.
export const buildScheduleResponse = (schedule: MockSchedule) => ({
  id: schedule.id, tenantId: 1, stackId: schedule.stackId, teamId: schedule.teamId,
  measurementField: schedule.measurementField, sampledAt: schedule.sampledAt,
  receivedAt: basicInfoStore[schedule.id]?.receivedAt ?? null,
  analyzedAt: basicInfoStore[schedule.id]?.analyzedAt ?? null,
  issuedAt: basicInfoStore[schedule.id]?.issuedAt ?? null,
  schedulePurpose: schedule.schedulePurpose, status: schedule.status,
  referenceNumber: schedule.referenceNumber, createdAt: schedule.createdAt, modifiedAt: schedule.createdAt,
  snapshot: buildSnapshot(schedule),
});

export const buildScheduleListResponse = (schedule: MockSchedule) => ({ ...schedule });

