import { http } from 'msw';
import type { SampleGrouping } from '@shared/model';
import { pollutants } from './pollutants';

import { BASE_URL, ok, fail } from '../utils';

/**
 * 고객사 측정방법 한 건. 서버 `measurement_methods` 와 같다.
 * 채취 단위·통칭 시료명·표준 채취시간은 물질이 아니라 측정방법이 갖는다 — 카트리지 채취시간을
 * 한 번 바꾸면 카트리지로 잡는 항목 전부에 반영된다.
 */
export type MeasurementMethodRow = {
  id: number;
  name: string;
  sampleGrouping: SampleGrouping;
  mergedSampleName: string | null;
  samplingMinutes: number | null;
  sortOrder: number;
};

/** 기본 8종. 서버 `MeasurementMethodPreset` 과 같다 — `POST /defaults` 가 이름 기준으로 채운다. */
const PRESETS: Omit<MeasurementMethodRow, 'id'>[] = [
  { name: '먼지',     sampleGrouping: 'NONE',     mergedSampleName: null,     samplingMinutes: null, sortOrder: 10 },
  { name: '중금속',   sampleGrouping: 'NONE',     mergedSampleName: null,     samplingMinutes: null, sortOrder: 20 },
  { name: '수은',     sampleGrouping: 'NONE',     mergedSampleName: null,     samplingMinutes: null, sortOrder: 30 },
  { name: '현장측정', sampleGrouping: 'NONE',     mergedSampleName: null,     samplingMinutes: null, sortOrder: 40 },
  { name: '흡수액',   sampleGrouping: 'PER_ITEM', mergedSampleName: null,     samplingMinutes: null, sortOrder: 50 },
  { name: '흡착관',   sampleGrouping: 'MERGED',   mergedSampleName: 'VOCs-T', samplingMinutes: null, sortOrder: 60 },
  { name: '테드라백', sampleGrouping: 'PER_ITEM', mergedSampleName: null,     samplingMinutes: null, sortOrder: 70 },
  { name: '카트리지', sampleGrouping: 'MERGED',   mergedSampleName: 'VOCs',   samplingMinutes: null, sortOrder: 80 },
];

// 수정·삭제 결과가 목록에 반영되도록 모듈 스코프 store 로 둔다(새로고침하면 초기화).
// id 1~8 은 schedule 핸들러의 스냅샷 사본과 맞춘다. 이 고객사는 흡수액·흡착관·카트리지에 표준 채취시간을 정해 둔 상태다.
export const measurementMethods: MeasurementMethodRow[] = PRESETS.map((preset, index) => ({
  id: index + 1,
  ...preset,
  samplingMinutes: preset.name === '흡수액' ? 40 : preset.sampleGrouping === 'MERGED' ? 30 : null,
}));

export const findMeasurementMethod = (id: number) => measurementMethods.find((m) => m.id === id);

const sorted = () => [...measurementMethods].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

/** 서버 도메인 불변식 — 통칭명은 MERGED 에만, MERGED 에는 반드시 통칭명. */
const isConsistent = (grouping: SampleGrouping, mergedSampleName: string | null) =>
  (grouping === 'MERGED') === (mergedSampleName !== null && mergedSampleName.trim() !== '');

const mismatch = () => fail('통칭 시료명은 한 병으로 함께 채취하는 측정방법에만 지정할 수 있습니다.', { status: 400 });

const notFound = () => fail('존재하지 않는 측정방법입니다.', { status: 404 });

/**
 * 측정물질이 참조 중인지. `pollutants.ts` 와 서로 import 하지만 요청 시점에만 읽으므로 순환이 문제되지 않는다
 * (`pollutants.ts` 는 여기서 이름·채취시간을 투영해 간다).
 */
const isReferenced = (methodId: number) => pollutants.some((p) => p.methodId === methodId);

export const measurementMethodHandlers = [
  http.get(`${BASE_URL}/measurement-methods`, () =>
    ok(sorted(), '측정방법 목록 조회 성공')),

  /** `/measurement-methods/:id` 보다 먼저 등록해야 그쪽이 가로채지 않는다. */
  http.post(`${BASE_URL}/measurement-methods/defaults`, () => {
    const existing = new Set(measurementMethods.map((m) => m.name));
    for (const preset of PRESETS) {
      if (existing.has(preset.name)) continue;
      measurementMethods.push({ id: Date.now() + measurementMethods.length, ...preset });
    }
    return ok(sorted(), '기본 측정방법 채우기 성공');
  }),

  http.get(`${BASE_URL}/measurement-methods/:methodId`, ({ params }) => {
    const found = findMeasurementMethod(Number(params.methodId));
    if (!found) return notFound();
    return ok(found, '측정방법 조회 성공');
  }),

  http.post(`${BASE_URL}/measurement-methods`, async ({ request }) => {
    const body = await request.json() as Partial<Omit<MeasurementMethodRow, 'id'>>;
    if (!body.name || !body.sampleGrouping) {
      return fail('입력값이 올바르지 않습니다.', { status: 400 });
    }
    if (measurementMethods.some((m) => m.name === body.name)) {
      return fail('이미 같은 이름의 측정방법이 있습니다.', { status: 409 });
    }
    const mergedSampleName = body.mergedSampleName?.trim() || null;
    if (!isConsistent(body.sampleGrouping, mergedSampleName)) return mismatch();

    const maxSortOrder = measurementMethods.reduce((max, m) => Math.max(max, m.sortOrder), 0);
    const created: MeasurementMethodRow = {
      id: Date.now(),
      name: body.name,
      sampleGrouping: body.sampleGrouping,
      mergedSampleName,
      samplingMinutes: body.samplingMinutes ?? null,
      sortOrder: body.sortOrder ?? maxSortOrder + 10,
    };
    measurementMethods.push(created);

    return ok(created, '측정방법 등록 성공', { status: 201 });
  }),

  http.put(`${BASE_URL}/measurement-methods/:methodId`, async ({ params, request }) => {
    const id = Number(params.methodId);
    const index = measurementMethods.findIndex((m) => m.id === id);
    if (index < 0) return notFound();

    // 서버 규약: name·sampleGrouping 은 null 이면 유지, mergedSampleName·samplingMinutes 는 보낸 값 그대로(null = 비움).
    const body = await request.json() as Partial<Omit<MeasurementMethodRow, 'id'>>;
    const current = measurementMethods[index];
    const name = body.name?.trim() || current.name;
    if (name !== current.name && measurementMethods.some((m) => m.id !== id && m.name === name)) {
      return fail('이미 같은 이름의 측정방법이 있습니다.', { status: 409 });
    }
    const sampleGrouping = body.sampleGrouping ?? current.sampleGrouping;
    const mergedSampleName = body.mergedSampleName?.trim() || null;
    if (!isConsistent(sampleGrouping, mergedSampleName)) return mismatch();

    const updated: MeasurementMethodRow = {
      ...current, name, sampleGrouping, mergedSampleName,
      samplingMinutes: body.samplingMinutes ?? null,
    };
    measurementMethods[index] = updated;

    return ok(updated, '측정방법 수정 성공');
  }),

  http.delete(`${BASE_URL}/measurement-methods/:methodId`, ({ params }) => {
    const id = Number(params.methodId);
    const index = measurementMethods.findIndex((m) => m.id === id);
    if (index < 0) return notFound();
    // 서버는 소유권(404) 다음에 참조 여부(409)를 본다.
    if (isReferenced(id)) {
      return fail('측정물질이 사용 중인 측정방법은 삭제할 수 없습니다.', { status: 409 });
    }
    measurementMethods.splice(index, 1);

    return ok(null, '측정방법 삭제 성공');
  }),
];
