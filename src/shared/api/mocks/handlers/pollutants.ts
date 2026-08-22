import { http, HttpResponse } from 'msw';
import type { MeasurementField, MeasurementMethod, PollutantPhase } from '@shared/model';

const BASE_URL = 'http://localhost:8080/api';

/**
 * 지원 물질 가이드 한 건 — 모든 고객사가 공통으로 참조하는 전역 마스터.
 * 실제 서버는 `catalog/pollutant-catalog.json` 시드로 채운다.
 *
 * 영문명·시험장비·시험방법은 **가이드가 보유하지 않는다** — 채택한 뒤 고객사가 입력하는 값이다.
 */
type CatalogRow = {
  id: number;
  code: string;
  field: MeasurementField;
  nameKr: string;
  method: MeasurementMethod | null;
  phase: PollutantPhase | null;
  sortOrder: number;
  active: boolean;
};

/**
 * 고객사가 채택한 측정물질. 가이드에 없는 물질은 만들 수 없으므로 `catalogId` 는 필수다.
 * 담긴 값은 전부 고객사 소유값이고, `code`·`field`·`method`·`phase` 는 조회 시 가이드에서 투영한다.
 */
type PollutantRow = {
  id: number;
  catalogId: number;
  nameKr: string;
  nameEn: string | null;
  equipment: string | null;
  testMethod: string | null;
};

// 수정·삭제 결과가 목록에 반영되도록 모듈 스코프 store 로 둔다(새로고침하면 초기화).
export const pollutantCatalog: CatalogRow[] = [
  { id: 1,  code: 'TSP',   field: 'AIR',             nameKr: '먼지',                 method: 'DUST',                phase: 'PARTICLE', sortOrder: 100, active: true },
  { id: 2,  code: 'PM10',  field: 'AIR',             nameKr: '미세먼지',             method: 'DUST',                phase: 'PARTICLE', sortOrder: 110, active: true },
  { id: 3,  code: 'SOX',   field: 'AIR',             nameKr: '황산화물',             method: 'FIELD_MEASUREMENT',   phase: 'GAS',      sortOrder: 210, active: true },
  { id: 4,  code: 'NOX',   field: 'AIR',             nameKr: '질소산화물',           method: 'FIELD_MEASUREMENT',   phase: 'GAS',      sortOrder: 200, active: true },
  { id: 5,  code: 'HCL',   field: 'AIR',             nameKr: '염화수소',             method: 'ABSORPTION_SOLUTION', phase: 'GAS',      sortOrder: 250, active: true },
  { id: 6,  code: 'CO',    field: 'AIR',             nameKr: '일산화탄소',           method: 'FIELD_MEASUREMENT',   phase: 'GAS',      sortOrder: 220, active: true },
  { id: 7,  code: 'THC',   field: 'AIR',             nameKr: '총탄화수소',           method: 'FIELD_MEASUREMENT',   phase: 'GAS',      sortOrder: 320, active: true },
  { id: 8,  code: 'PB',    field: 'AIR',             nameKr: '납',                   method: 'HEAVY_METAL',         phase: 'PARTICLE', sortOrder: 500, active: true },
  // phase 를 비워 둔 항목 — 가이드도 선택 항목은 null 일 수 있다
  { id: 9,  code: 'BOD',   field: 'WATER',           nameKr: '생물화학적산소요구량', method: 'FIELD_MEASUREMENT',   phase: null,       sortOrder: 100, active: true },
  { id: 10, code: 'COD',   field: 'WATER',           nameKr: '화학적산소요구량',     method: 'FIELD_MEASUREMENT',   phase: null,       sortOrder: 110, active: true },
  { id: 11, code: 'SS',    field: 'WATER',           nameKr: '부유물질',             method: 'FIELD_MEASUREMENT',   phase: 'PARTICLE', sortOrder: 120, active: true },
  // 대기 납과 code 가 같지만 분야가 달라 별개 물질이다 — code 만으로 물질을 특정할 수 없음을 보여준다
  { id: 12, code: 'PB',    field: 'WATER',           nameKr: '납',                   method: 'HEAVY_METAL',         phase: null,       sortOrder: 300, active: true },
  { id: 13, code: 'NOISE', field: 'NOISE_VIBRATION', nameKr: '소음',                 method: 'FIELD_MEASUREMENT',   phase: null,       sortOrder: 100, active: true },
  { id: 14, code: 'NH3',   field: 'ODOR',            nameKr: '암모니아',             method: 'ABSORPTION_SOLUTION', phase: 'GAS',      sortOrder: 100, active: true },
  // 폐지된 가이드 항목 — 새로 채택할 수 없어 후보에서 빠진다
  { id: 15, code: 'CS2',   field: 'AIR',             nameKr: '이황화탄소',           method: 'ABSORPTION_SOLUTION', phase: 'GAS',      sortOrder: 300, active: false },
];

const pollutants: PollutantRow[] = [
  { id: 101, catalogId: 4, nameKr: '질소산화물', nameEn: 'Nitrogen Oxides', equipment: '자동가스분석기', testMethod: 'ES 01303.2 (사내)' },
  // 채택만 해 두고 영문명·분석 정보는 아직 비운 상태
  { id: 102, catalogId: 1, nameKr: '먼지', nameEn: null, equipment: null, testMethod: null },
  // 폐지된 가이드 항목을 이미 채택해 쓰는 중 — 목록에는 계속 보이고 후보에서만 빠진다
  { id: 103, catalogId: 15, nameKr: '이황화탄소', nameEn: 'Carbon Disulfide', equipment: '흡수병', testMethod: 'ES 01405.1' },
];

const findCatalog = (catalogId: number) => pollutantCatalog.find((c) => c.id === catalogId);

const sortOrderOf = (catalogId: number) => findCatalog(catalogId)?.sortOrder ?? 0;

/**
 * 고객사 소유값에 가이드 투영값(code·field·method·phase)을 얹는다.
 * 서버 `PollutantEntityMapper.toDomain` 과 같은 규칙이다.
 */
const toResponse = (pollutant: PollutantRow) => {
  const base = findCatalog(pollutant.catalogId);

  return {
    id: pollutant.id,
    catalogId: pollutant.catalogId,
    code: base?.code ?? '',
    field: base?.field ?? 'AIR',
    nameKr: pollutant.nameKr,
    nameEn: pollutant.nameEn,
    method: base?.method ?? null,
    phase: base?.phase ?? null,
    equipment: pollutant.equipment,
    testMethod: pollutant.testMethod,
  };
};

const toCandidate = (base: CatalogRow) => ({
  catalogId: base.id,
  code: base.code,
  field: base.field,
  nameKr: base.nameKr,
  method: base.method,
  phase: base.phase,
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

    return HttpResponse.json({
      status: true,
      message: '측정물질 후보 조회 성공',
      data,
    });
  }),

  /** 채택분만. 가이드에만 있는 항목은 포함하지 않는다. */
  http.get(`${BASE_URL}/pollutants`, ({ request }) => {
    const field = new URL(request.url).searchParams.get('field');

    const data = pollutants
      .map(toResponse)
      .filter((item) => !field || item.field === field)
      .sort((a, b) => sortOrderOf(a.catalogId) - sortOrderOf(b.catalogId));

    return HttpResponse.json({
      status: true,
      message: '측정물질 목록 조회 성공',
      data,
    });
  }),

  http.get(`${BASE_URL}/pollutants/:pollutantId`, ({ params }) => {
    const id = Number(params.pollutantId);
    const found = pollutants.find((p) => p.id === id);
    if (!found) {
      return HttpResponse.json(
        { status: false, message: '측정물질을 찾을 수 없습니다.', data: null },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      status: true,
      message: '측정물질 상세 조회 성공',
      data: toResponse(found),
    });
  }),

  http.post(`${BASE_URL}/pollutants`, async ({ request }) => {
    const body = await request.json() as Partial<Omit<PollutantRow, 'id'>>;
    const base = body.catalogId != null ? findCatalog(body.catalogId) : undefined;

    if (!base) {
      return HttpResponse.json(
        { status: false, message: '존재하지 않는 측정물질 카탈로그입니다.', data: null },
        { status: 404 },
      );
    }
    if (!base.active) {
      return HttpResponse.json(
        { status: false, message: '폐지된 측정물질은 새로 등록할 수 없습니다.', data: null },
        { status: 400 },
      );
    }
    if (pollutants.some((p) => p.catalogId === base.id)) {
      return HttpResponse.json(
        { status: false, message: '이미 등록된 카탈로그 측정물질입니다.', data: null },
        { status: 409 },
      );
    }

    // nameKr 을 비우면 가이드의 표준 국문명을 복사한다.
    const created: PollutantRow = {
      id: Date.now(),
      catalogId: base.id,
      nameKr: body.nameKr?.trim() || base.nameKr,
      nameEn: body.nameEn ?? null,
      equipment: body.equipment ?? null,
      testMethod: body.testMethod ?? null,
    };
    pollutants.push(created);

    return HttpResponse.json({
      status: true,
      message: '측정물질 등록 성공',
      data: toResponse(created),
    }, { status: 201 });
  }),

  http.put(`${BASE_URL}/pollutants/:pollutantId`, async ({ params, request }) => {
    const id = Number(params.pollutantId);
    const index = pollutants.findIndex((p) => p.id === id);
    if (index < 0) {
      return HttpResponse.json(
        { status: false, message: '측정물질을 찾을 수 없습니다.', data: null },
        { status: 404 },
      );
    }

    // 서버는 전달되지 않았거나 빈 문자열인 필드를 기존 값으로 유지하고, catalogId 는 받지 않는다.
    const body = await request.json() as Record<string, unknown>;
    const updated = { ...pollutants[index] };
    for (const [key, value] of Object.entries(body)) {
      if (key === 'id' || key === 'catalogId') continue;
      if (value === null || value === undefined || value === '') continue;
      Object.assign(updated, { [key]: value });
    }
    pollutants[index] = updated;

    return HttpResponse.json({
      status: true,
      message: '측정물질 수정 성공',
      data: toResponse(updated),
    });
  }),

  http.delete(`${BASE_URL}/pollutants/:pollutantId`, ({ params }) => {
    const id = Number(params.pollutantId);
    const index = pollutants.findIndex((p) => p.id === id);
    if (index < 0) {
      return HttpResponse.json(
        { status: false, message: '측정물질을 찾을 수 없습니다.', data: null },
        { status: 404 },
      );
    }
    // 채택을 취소하면 그 가이드 항목이 다시 후보 목록에 뜬다.
    pollutants.splice(index, 1);

    return HttpResponse.json({
      status: true,
      message: '측정물질 삭제 성공',
      data: null,
    });
  }),
];
