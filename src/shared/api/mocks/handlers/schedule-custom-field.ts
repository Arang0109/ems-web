import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

/**
 * 고객사 커스텀 필드 정의 한 건. 서버 `schedule_custom_fields` 와 같다.
 * 이름만 갖고 값은 측정계획 스냅샷(`schedule.ts` 의 `customFieldValueStore`)이 갖는다.
 */
export type ScheduleCustomFieldRow = {
  id: number;
  key: string;
  label: string;
  sortOrder: number;
};

/** 서버 `CustomFieldDefinition.KEY_REGEX` 와 예약어 — 등록 시 같은 규칙으로 400 을 낸다. */
const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const RESERVED_KEYS = new Set([
  'class', 'empty', 'size',
  'eq', 'ne', 'lt', 'gt', 'le', 'ge', 'and', 'or', 'not', 'null', 'true', 'false',
  'new', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'do', 'return', 'function',
]);

// 수정·삭제 결과가 목록에 반영되도록 모듈 스코프 store 로 둔다(새로고침하면 초기화).
export const scheduleCustomFields: ScheduleCustomFieldRow[] = [
  { id: 1, key: 'siteCode', label: '현장 코드', sortOrder: 10 },
  { id: 2, key: 'inspector', label: '점검자', sortOrder: 20 },
  { id: 3, key: 'note', label: '비고', sortOrder: 30 },
];

/** 회차 값 저장의 키 검증과 템플릿 검사가 "알려진 커스텀 키"를 여기서 얻는다. */
export const definedCustomFieldKeys = () => new Set(scheduleCustomFields.map((f) => f.key));

const sorted = () => [...scheduleCustomFields].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

const notFound = () => HttpResponse.json(
  { status: false, message: '존재하지 않는 커스텀 필드입니다.', data: null },
  { status: 404 },
);

export const scheduleCustomFieldHandlers = [
  /**
   * `/schedules/:id` 보다 먼저 등록해야 그쪽이 `custom-fields` 를 id 로 잡지 않는다 —
   * `handlers/index.ts` 의 REGISTRY 에서 `schedule` 앞에 둔다.
   */
  http.get(`${BASE_URL}/schedules/custom-fields`, () =>
    HttpResponse.json({ status: true, message: '커스텀 필드 목록 조회 성공', data: sorted() })),

  http.post(`${BASE_URL}/schedules/custom-fields`, async ({ request }) => {
    const body = await request.json() as Partial<Omit<ScheduleCustomFieldRow, 'id'>>;
    const key = body.key?.trim() ?? '';
    const label = body.label?.trim() ?? '';
    if (!key || !label || key.length > 50 || label.length > 100 || !KEY_PATTERN.test(key) || RESERVED_KEYS.has(key)) {
      return HttpResponse.json(
        { status: false, message: '커스텀 필드 키는 영문자·숫자·밑줄만 쓸 수 있고 영문자 또는 밑줄로 시작해야 하며, 예약어는 쓸 수 없습니다.', data: null },
        { status: 400 },
      );
    }
    if (scheduleCustomFields.some((f) => f.key === key)) {
      return HttpResponse.json(
        { status: false, message: '이미 같은 키의 커스텀 필드가 있습니다.', data: null },
        { status: 409 },
      );
    }

    const maxSortOrder = scheduleCustomFields.reduce((max, f) => Math.max(max, f.sortOrder), 0);
    const created: ScheduleCustomFieldRow = {
      id: Date.now(),
      key,
      label,
      sortOrder: body.sortOrder ?? maxSortOrder + 10,
    };
    scheduleCustomFields.push(created);

    return HttpResponse.json({ status: true, message: '커스텀 필드 등록 성공', data: created }, { status: 201 });
  }),

  http.put(`${BASE_URL}/schedules/custom-fields/:fieldId`, async ({ params, request }) => {
    const id = Number(params.fieldId);
    const index = scheduleCustomFields.findIndex((f) => f.id === id);
    if (index < 0) return notFound();

    // 서버 규약: 라벨·표시 순서만, null 은 유지. 키는 바뀌지 않는다.
    const body = await request.json() as Partial<Pick<ScheduleCustomFieldRow, 'label' | 'sortOrder'>>;
    const current = scheduleCustomFields[index];
    const updated: ScheduleCustomFieldRow = {
      ...current,
      label: body.label?.trim() || current.label,
      sortOrder: body.sortOrder ?? current.sortOrder,
    };
    scheduleCustomFields[index] = updated;

    return HttpResponse.json({ status: true, message: '커스텀 필드 수정 성공', data: updated });
  }),

  /** 정의만 지운다 — 스냅샷에 저장된 값(`customFieldValueStore`)은 건드리지 않는다(서버와 같다). */
  http.delete(`${BASE_URL}/schedules/custom-fields/:fieldId`, ({ params }) => {
    const id = Number(params.fieldId);
    const index = scheduleCustomFields.findIndex((f) => f.id === id);
    if (index < 0) return notFound();
    scheduleCustomFields.splice(index, 1);

    return HttpResponse.json({ status: true, message: '커스텀 필드 삭제 성공', data: null });
  }),
];
