import { http } from 'msw';
import type { MeasurementField, MeasurementMode, PollutantPhase } from '@shared/model';
import { findMeasurementMethod } from './measurement-method';

import { BASE_URL, ok, fail } from '../utils';

/**
 * 지원 물질 가이드 한 건 — 모든 고객사가 공통으로 참조하는 전역 마스터.
 * 실제 서버는 `catalog/pollutant-catalog.json` 시드로 채운다.
 *
 * 영문명·시험장비·시험방법은 **가이드가 보유하지 않는다** — 채택한 뒤 고객사가 입력하는 값이다.
 * 측정방법도 가이드가 갖지 않는다 — 같은 물질이라도 업체마다 다를 수 있어 채택 시 고객사가 정한다.
 */
type CatalogRow = {
  id: number;
  code: string;
  field: MeasurementField;
  nameKr: string;
  phase: PollutantPhase | null;
  mode: MeasurementMode | null;
  sortOrder: number;
  active: boolean;
};

/**
 * 고객사가 채택한 측정물질. 가이드에 없는 물질은 만들 수 없으므로 `catalogId` 는 필수다.
 * 담긴 값은 전부 고객사 소유값이고, `code`·`field`·`phase` 는 조회 시 가이드에서, 측정방법 속성은
 * `measurement-method` 핸들러에서 투영한다. `methodId` 는 채택 시 고객사가 정한다 — 정해지지 않은
 * 레거시 행은 null 일 수 있다.
 */
export type PollutantRow = {
  id: number;
  catalogId: number;
  methodId: number | null;
  /** 항목별 채취시간 오버라이드(분). null 이면 측정방법 표준값 */
  samplingMinutes: number | null;
  nameKr: string;
  nameEn: string | null;
  equipment: string | null;
  testMethod: string | null;
};

// 수정·삭제 결과가 목록에 반영되도록 모듈 스코프 store 로 둔다(새로고침하면 초기화).
export const pollutantCatalog: CatalogRow[] = [
  { id: 1,  code: 'TSP',   field: 'AIR',             nameKr: '먼지',                 phase: 'PARTICLE', mode: 'DUST',             sortOrder: 100, active: true },
  { id: 2,  code: 'PM10',  field: 'AIR',             nameKr: '미세먼지',             phase: 'PARTICLE', mode: 'DUST',             sortOrder: 110, active: true },
  { id: 3,  code: 'SOX',   field: 'AIR',             nameKr: '황산화물',             phase: 'GAS',      mode: 'DIRECT_READING',   sortOrder: 210, active: true },
  { id: 4,  code: 'NOX',   field: 'AIR',             nameKr: '질소산화물',           phase: 'GAS',      mode: 'DIRECT_READING',   sortOrder: 200, active: true },
  { id: 5,  code: 'HCL',   field: 'AIR',             nameKr: '염화수소',             phase: 'GAS',      mode: 'GAS_SAMPLING',     sortOrder: 250, active: true },
  { id: 6,  code: 'CO',    field: 'AIR',             nameKr: '일산화탄소',           phase: 'GAS',      mode: 'DIRECT_READING',   sortOrder: 220, active: true },
  { id: 7,  code: 'THC',   field: 'AIR',             nameKr: '총탄화수소',           phase: 'GAS',      mode: 'DIRECT_READING',   sortOrder: 320, active: true },
  { id: 8,  code: 'PB',    field: 'AIR',             nameKr: '납',                   phase: 'PARTICLE', mode: 'HEAVY_METAL',      sortOrder: 500, active: true },
  // phase 를 비워 둔 항목 — 가이드도 선택 항목은 null 일 수 있다
  { id: 9,  code: 'BOD',   field: 'WATER',           nameKr: '생물화학적산소요구량', phase: null,       mode: null,               sortOrder: 100, active: true },
  { id: 10, code: 'COD',   field: 'WATER',           nameKr: '화학적산소요구량',     phase: null,       mode: null,               sortOrder: 110, active: true },
  { id: 11, code: 'SS',    field: 'WATER',           nameKr: '부유물질',             phase: 'PARTICLE', mode: 'DUST',             sortOrder: 120, active: true },
  // 대기 납과 code 가 같지만 분야가 달라 별개 물질이다 — code 만으로 물질을 특정할 수 없음을 보여준다
  { id: 12, code: 'PB',    field: 'WATER',           nameKr: '납',                   phase: null,       mode: null,               sortOrder: 300, active: true },
  { id: 13, code: 'NOISE', field: 'NOISE_VIBRATION', nameKr: '소음',                 phase: null,       mode: null,               sortOrder: 100, active: true },
  { id: 14, code: 'NH3',   field: 'ODOR',            nameKr: '암모니아',             phase: 'GAS',      mode: null,               sortOrder: 100, active: true },
  // 폐지된 가이드 항목 — 새로 채택할 수 없어 후보에서 빠진다
  { id: 15, code: 'CS2',   field: 'AIR',             nameKr: '이황화탄소',           phase: 'GAS',      mode: 'GAS_SAMPLING',     sortOrder: 300, active: false },
];

// methodId 는 measurement-method 핸들러의 기본 8종(1 먼지 … 4 현장측정 … 8 카트리지)을 가리킨다.
export const pollutants: PollutantRow[] = [
  { id: 101, catalogId: 4, methodId: 4, samplingMinutes: null, nameKr: '질소산화물', nameEn: 'Nitrogen Oxides', equipment: '자동가스분석기', testMethod: 'ES 01303.2 (사내)' },
  // 채택만 해 두고 영문명·분석 정보는 아직 비운 상태
  { id: 102, catalogId: 1, methodId: 1, samplingMinutes: null, nameKr: '먼지', nameEn: null, equipment: null, testMethod: null },
  // 폐지된 가이드 항목을 이미 채택해 쓰는 중 — 목록에는 계속 보이고 후보에서만 빠진다.
  // 측정방법이 정해지지 않은 레거시 행이라 methodId 가 비어 있다 — 수정 화면에서 채운다.
  { id: 103, catalogId: 15, methodId: null, samplingMinutes: null, nameKr: '이황화탄소', nameEn: 'Carbon Disulfide', equipment: '흡수병', testMethod: 'ES 01405.1' },
  // 흡수액(표준 40분)으로 잡지만 이 물질만 항목별 60분 — 항목 오버라이드가 방법 표준값을 이기는 예.
  { id: 104, catalogId: 5, methodId: 5, samplingMinutes: 60, nameKr: '염화수소', nameEn: 'Hydrogen Chloride', equipment: '흡수병', testMethod: 'ES 01303' },
];

const findCatalog = (catalogId: number) => pollutantCatalog.find((c) => c.id === catalogId);

const overrideNotAllowed = () => fail('한 병으로 함께 채취하는 측정방법의 항목에는 항목별 채취시간을 둘 수 없습니다.', { status: 400 });

const sortOrderOf = (catalogId: number) => findCatalog(catalogId)?.sortOrder ?? 0;

/**
 * 고객사 소유값에 가이드 투영값(code·field·phase)과 측정방법 투영값(이름·채취 단위·통칭명·채취시간)을 얹는다.
 * 서버 `PollutantEntityMapper.toDomain` 과 같은 규칙이다. 측정방법이 없으면 투영값은 전부 null 이다.
 */
const toResponse = (pollutant: PollutantRow) => {
  const base = findCatalog(pollutant.catalogId);
  const method = pollutant.methodId === null ? undefined : findMeasurementMethod(pollutant.methodId);

  return {
    id: pollutant.id,
    catalogId: pollutant.catalogId,
    code: base?.code ?? '',
    field: base?.field ?? 'AIR',
    nameKr: pollutant.nameKr,
    nameEn: pollutant.nameEn,
    methodId: method?.id ?? null,
    methodName: method?.name ?? null,
    sampleGrouping: method?.sampleGrouping ?? null,
    mergedSampleName: method?.mergedSampleName ?? null,
    samplingMinutes: pollutant.samplingMinutes,
    methodSamplingMinutes: method?.samplingMinutes ?? null,
    // 서버 Pollutant.getEffectiveSamplingMinutes 와 같은 규칙 — 통칭 채취는 방법 값만, 아니면 오버라이드 우선.
    effectiveSamplingMinutes: method?.sampleGrouping === 'MERGED'
      ? (method.samplingMinutes ?? null)
      : (pollutant.samplingMinutes ?? method?.samplingMinutes ?? null),
    phase: base?.phase ?? null,
    mode: base?.mode ?? null,
    equipment: pollutant.equipment,
    testMethod: pollutant.testMethod,
  };
};

const toCandidate = (base: CatalogRow) => ({
  catalogId: base.id,
  code: base.code,
  field: base.field,
  nameKr: base.nameKr,
  phase: base.phase,
  mode: base.mode,
  sortOrder: base.sortOrder,
});

export const pollutantHandlers = [
  /**
   * 채택 후보 — 아직 채택하지 않은 활성 가이드 항목만.
   * `/pollutants/:pollutantId` 보다 먼저 등록해야 그쪽이 가로채지 않는다.
   */
  http.get(`${BASE_URL}/pollutants/candidates`, ({ request }) => {
    const field = new URL(request.url).searchParams.get('field');
    const adopted = new Set(pollutants.map((p) => p.catalogId));

    const data = pollutantCatalog
      .filter((item) => item.active && !adopted.has(item.id))
      .filter((item) => !field || item.field === field)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(toCandidate);

    return ok(data, '측정물질 후보 조회 성공');
  }),

  /** 채택분만. 가이드에만 있는 항목은 포함하지 않는다. */
  http.get(`${BASE_URL}/pollutants`, ({ request }) => {
    const field = new URL(request.url).searchParams.get('field');

    const data = pollutants
      .map(toResponse)
      .filter((item) => !field || item.field === field)
      .sort((a, b) => sortOrderOf(a.catalogId) - sortOrderOf(b.catalogId));

    return ok(data, '측정물질 목록 조회 성공');
  }),

  http.get(`${BASE_URL}/pollutants/:pollutantId`, ({ params }) => {
    const id = Number(params.pollutantId);
    const found = pollutants.find((p) => p.id === id);
    if (!found) {
      return fail('측정물질을 찾을 수 없습니다.', { status: 404 });
    }

    return ok(toResponse(found), '측정물질 상세 조회 성공');
  }),

  http.post(`${BASE_URL}/pollutants`, async ({ request }) => {
    const body = await request.json() as Partial<Omit<PollutantRow, 'id'>>;
    const base = body.catalogId != null ? findCatalog(body.catalogId) : undefined;

    if (!base) {
      return fail('존재하지 않는 측정물질 카탈로그입니다.', { status: 404 });
    }
    if (!base.active) {
      return fail('폐지된 측정물질은 새로 등록할 수 없습니다.', { status: 400 });
    }
    if (pollutants.some((p) => p.catalogId === base.id)) {
      return fail('이미 등록된 카탈로그 측정물질입니다.', { status: 409 });
    }
    // 서버 CreatePollutantRequest.methodId 는 @NotNull 이고, 이 고객사의 측정방법이어야 한다(아니면 404 은닉).
    if (body.methodId == null) {
      return fail('측정방법은 필수입니다.', { status: 400 });
    }
    const method = findMeasurementMethod(body.methodId);
    if (!method) {
      return fail('존재하지 않는 측정방법입니다.', { status: 404 });
    }
    if (body.samplingMinutes != null && method.sampleGrouping === 'MERGED') return overrideNotAllowed();

    // nameKr 을 비우면 가이드의 표준 국문명을 복사한다.
    const created: PollutantRow = {
      id: Date.now(),
      catalogId: base.id,
      methodId: body.methodId,
      samplingMinutes: body.samplingMinutes ?? null,
      nameKr: body.nameKr?.trim() || base.nameKr,
      nameEn: body.nameEn ?? null,
      equipment: body.equipment ?? null,
      testMethod: body.testMethod ?? null,
    };
    pollutants.push(created);

    return ok(toResponse(created), '측정물질 등록 성공', { status: 201 });
  }),

  http.put(`${BASE_URL}/pollutants/:pollutantId`, async ({ params, request }) => {
    const id = Number(params.pollutantId);
    const index = pollutants.findIndex((p) => p.id === id);
    if (index < 0) {
      return fail('측정물질을 찾을 수 없습니다.', { status: 404 });
    }

    // 서버는 전달되지 않았거나 빈 문자열인 필드를 기존 값으로 유지하고, catalogId 는 받지 않는다.
    // methodId 도 같은 규칙이다 — null 이면 기존 값 유지, 값이 오면 이 고객사의 측정방법이어야 한다.
    const body = await request.json() as Record<string, unknown>;
    if (typeof body.methodId === 'number' && !findMeasurementMethod(body.methodId)) {
      return fail('존재하지 않는 측정방법입니다.', { status: 404 });
    }
    // samplingMinutes 만 전체 채택 — 서버는 "이 수정 뒤 적용될 방법" 기준으로 MERGED 를 막는다.
    const effectiveMethodId = typeof body.methodId === 'number' ? body.methodId : pollutants[index].methodId;
    const effectiveMethod = effectiveMethodId === null ? undefined : findMeasurementMethod(effectiveMethodId);
    const samplingMinutes = typeof body.samplingMinutes === 'number' ? body.samplingMinutes : null;
    if (samplingMinutes !== null && effectiveMethod?.sampleGrouping === 'MERGED') return overrideNotAllowed();

    const updated = { ...pollutants[index], samplingMinutes };
    for (const [key, value] of Object.entries(body)) {
      if (key === 'id' || key === 'catalogId' || key === 'samplingMinutes') continue;
      if (value === null || value === undefined || value === '') continue;
      Object.assign(updated, { [key]: value });
    }
    pollutants[index] = updated;

    return ok(toResponse(updated), '측정물질 수정 성공');
  }),

  http.delete(`${BASE_URL}/pollutants/:pollutantId`, ({ params }) => {
    const id = Number(params.pollutantId);
    const index = pollutants.findIndex((p) => p.id === id);
    if (index < 0) {
      return fail('측정물질을 찾을 수 없습니다.', { status: 404 });
    }
    // 채택을 취소하면 그 가이드 항목이 다시 후보 목록에 뜬다.
    pollutants.splice(index, 1);

    return ok(null, '측정물질 삭제 성공');
  }),
];
