// 측정계획 목 — 분할 전 `handlers/schedule.ts` 의 한 조각. 조립은 `./index.ts`.
import type { ScheduleStatus } from '@shared/model';

// ── 시트 저장소 (계획별 측정 시트 메모리 보관) ─────────────────
export const sheetStore: Record<number, unknown[]> = {};

// ── 기본정보 저장소 ────────────────────────────────────────────
// 값의 주인이 갈려 저장 경로도 갈린다 — 채취 시각·현장 담당자는 PUT /sheets,
// 서명란 담당자는 PATCH /tenant, 측정자 표기는 PATCH /team 이다.
// 일자 셋은 메타(schedule) 소유이고 PATCH /report-dates 가 전체 채택으로 다룬다 —
// 부분 갱신인 나머지와 규칙이 다르므로 키 묶음을 나눠 둔다. 저장소는 하나로 공유한다.
export const SAMPLING_INFO_KEYS = [
  'samplingStartedAt', 'samplingEndedAt', 'facilityManager', 'samplingWitness',
] as const;
export const TENANT_STAFF_KEYS = ['analyst', 'technicalManager'] as const;
export const TEAM_MEMBER_KEYS = ['mentorName', 'menteeName'] as const;
export const REPORT_DATE_KEYS = ['receivedAt', 'analyzedAt', 'issuedAt'] as const;

export type BasicInfoKey =
  | (typeof SAMPLING_INFO_KEYS)[number]
  | (typeof TENANT_STAFF_KEYS)[number]
  | (typeof TEAM_MEMBER_KEYS)[number]
  | (typeof REPORT_DATE_KEYS)[number];

export type MockBasicInfo = Partial<Record<BasicInfoKey, string>>;
export const basicInfoStore: Record<number, MockBasicInfo> = {};

// 회차별 커스텀 필드 값(키 → 값). 정의(`schedule-custom-field.ts`)를 지워도 여기 값은 남는다 — 서버와 같다.
// id 1 은 값이 있는 상태, 나머지는 필드 도입 전 문서처럼 null 로 둔다.
export const customFieldValueStore: Record<number, Record<string, string> | null> = {
  1: { siteCode: 'A-01', inspector: '홍길동' },
};

// 계획별로 선택된 측정물질 id. 등록 시 고른 항목을 흉내 낸 기본값이다.
// 가스상 자동 채움(염화수소 / VOCs-T / VOCs / 이황화메틸 / 비소화합물)이 바로 보이도록 채취 방법별 항목을 섞어 둔다.
export const itemsStore: Record<number, number[]> = {};
export const selectedPollutantIds = (scheduleId: number): number[] =>
  itemsStore[scheduleId] ?? [1, 2, 4, 21, 22, 23, 24, 25, 26];

// 계획별로 정정된 측정 조건. 스냅샷이 원장 사본이라는 성질을 흉내 내려면 원장(ITEM_POOL)이
// 아니라 계획 쪽에 얹혀 있어야 한다 — 정정은 그 회차 문서에만 남는다.
export type ItemCondition = { cycle: string; allowance: number | null; oxygenApplicable: boolean };
export const itemConditionStore: Record<number, Record<number, ItemCondition>> = {};

/**
 * 저장된 측정 데이터에서 진행 단계를 재도출한다(서버 `ScheduleProgress` 와 같은 규칙).
 * 재개방이 어느 단계로 돌아갈지 정하는 데 쓴다.
 */
export const deriveProgress = (scheduleId: number): ScheduleStatus => {
  const basicInfo = basicInfoStore[scheduleId] ?? {};
  if (basicInfo.receivedAt) return 'ANALYZING';
  if (basicInfo.samplingStartedAt || (sheetStore[scheduleId]?.length ?? 0) > 0) return 'MEASURING';
  return 'SCHEDULED';
};

