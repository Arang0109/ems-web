// 측정계획 목 — 분할 전 `handlers/schedule.ts` 의 한 조각. 조립은 `./index.ts`.
import { http } from 'msw';

import { canDeleteSchedule, canReopenSchedule, canTransitionScheduleStatus, isTerminalScheduleStatus } from '@entities/schedule';
import { definedCustomFieldKeys } from '../schedule-custom-field';
import { MEASUREMENT_CATEGORY_LABEL } from '@shared/config';
import {
  type MeasurementCategory,
} from '@shared/model';

import { BASE_URL, ok, fail } from '../../utils';

import { ITEM_POOL, type MockSchedule, db, now } from './fixtures';
import { type BasicInfoKey, type ItemCondition, type MockBasicInfo, REPORT_DATE_KEYS, SAMPLING_INFO_KEYS, TEAM_MEMBER_KEYS, TENANT_STAFF_KEYS, basicInfoStore, customFieldValueStore, deriveProgress, itemConditionStore, itemsStore, selectedPollutantIds, sheetStore } from './store';
import { type LooseSheet, computeSheet } from './calc';
import { buildScheduleListResponse, buildScheduleResponse } from './responses';

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
  const schedule = db.schedules.find((s) => s.id === id);
  if (!schedule) {
    return fail('측정계획을 찾을 수 없습니다.', { status: 404 });
  }
  if (isTerminalScheduleStatus(schedule.status)) {
    return fail('성적서 작성이 완료되었거나 취소된 측정계획은 수정할 수 없습니다.', { status: 409 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const merged: MockBasicInfo = { ...(basicInfoStore[id] ?? {}) };
  for (const key of keys) {
    const value = body[key];
    if (typeof value === 'string' && value !== '') merged[key] = value;
  }
  basicInfoStore[id] = merged;

  return ok(buildScheduleResponse(schedule), message);
};

export const scheduleHandlers = [
  // 목록 조회 — 취소된 계획은 제외한다.
  http.get(`${BASE_URL}/schedules`, () => {
    const active = db.schedules
      .filter((s) => s.status !== 'CANCELED')
      .map(buildScheduleListResponse);
    return ok(active, '측정계획 목록 조회 성공');
  }),

  // 취소된 측정계획 목록 — `/schedules/:id` 보다 먼저 등록해야 "canceled"가 id로 잡히지 않는다.
  http.get(`${BASE_URL}/schedules/canceled`, () => {
    const canceled = db.schedules
      .filter((s) => s.status === 'CANCELED')
      .map(buildScheduleListResponse);
    return ok(canceled, '취소된 측정계획 목록 조회 성공');
  }),

  // 상세 조회 (스냅샷 포함)
  http.get(`${BASE_URL}/schedules/:id`, ({ params }) => {
    const id = Number(params.id);
    const schedule = db.schedules.find((s) => s.id === id);
    if (!schedule) {
      return fail('측정계획을 찾을 수 없습니다.', { status: 404 });
    }
    return ok(buildScheduleResponse(schedule), '측정계획 상세 조회 성공');
  }),

  // 계획 정의 수정 — 채취일자·측정용도·관리번호. 측정분야와 측정 대상은 생성 시점에만 정한다.
  // (구체적 경로가 먼저 잡히도록 /schedules/:id/sheets 뒤에 둔다.)
  http.put(`${BASE_URL}/schedules/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const schedule = db.schedules.find((s) => s.id === id);
    if (!schedule) {
      return fail('측정계획을 찾을 수 없습니다.', { status: 404 });
    }
    if (isTerminalScheduleStatus(schedule.status)) {
      return fail('성적서 작성이 완료되었거나 취소된 측정계획은 수정할 수 없습니다.', { status: 409 });
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
      return fail('채취일자는 필수 값입니다.', { status: 400 });
    }

    schedule.sampledAt = sampledAt;
    schedule.referenceNumber = text('referenceNumber');

    const purpose = text('schedulePurpose');
    schedule.schedulePurpose = purpose === 'SELF' || purpose === 'REFERENCE' ? purpose : null;

    return ok(buildScheduleResponse(schedule), '측정계획 수정 성공');
  }),

  // 측정 시트 저장 (서버 계산 흉내 후 저장)
  http.put(`${BASE_URL}/schedules/:id/sheets`, async ({ params, request }) => {
    const id = Number(params.id);
    const schedule = db.schedules.find((s) => s.id === id);
    if (!schedule) {
      return fail('측정계획을 찾을 수 없습니다.', { status: 404 });
    }
    if (isTerminalScheduleStatus(schedule.status)) {
      return fail('성적서 작성이 완료되었거나 취소된 측정계획은 수정할 수 없습니다.', { status: 409 });
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
      return fail(`다른 사용자가 ${[...new Set(conflicted)].join('·')} 측정 데이터를 먼저 저장했습니다.`
            + ' 최신 내용을 불러온 뒤 다시 저장해 주세요.', { status: 409 });
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

    return ok(buildScheduleResponse(schedule), '측정 데이터 저장 성공');
  }),

  // 측정항목 교체 — 전달 목록으로 전체 교체한다(부분 수정이 아니다).
  http.patch(`${BASE_URL}/schedules/:id/items`, async ({ params, request }) => {
    const id = Number(params.id);
    const schedule = db.schedules.find((s) => s.id === id);
    if (!schedule) {
      return fail('측정계획을 찾을 수 없습니다.', { status: 404 });
    }
    if (isTerminalScheduleStatus(schedule.status)) {
      return fail('성적서 작성이 완료되었거나 취소된 측정계획은 수정할 수 없습니다.', { status: 409 });
    }

    const body = (await request.json()) as { pollutantIds?: number[] };
    const pollutantIds = body.pollutantIds ?? [];
    if (pollutantIds.length === 0) {
      return fail('측정 항목은 하나 이상 선택해야 합니다.', { status: 400 });
    }

    // 서버는 이미 포함돼 있던 항목이면 원장에서 빠졌어도 스냅샷 값을 유지한다.
    const kept = selectedPollutantIds(id);
    const unknown = pollutantIds.filter(
      (pollutantId) => !kept.includes(pollutantId)
        && !ITEM_POOL.some((item) => item.pollutantId === pollutantId),
    );
    if (unknown.length > 0) {
      return fail('측정시설에 등록되지 않은 측정항목입니다.', { status: 400 });
    }

    itemsStore[id] = [...new Set(pollutantIds)];

    return ok(buildScheduleResponse(schedule), '측정항목 수정 성공');
  }),

  // 측정항목 정정 — 이 회차 문서에 담긴 항목 하나의 측정 조건만 바로잡는다.
  // 원장(stack-pollutant)은 건드리지 않으므로, 화면이 원장까지 고치려면 그 API를 따로 부른다.
  http.patch(`${BASE_URL}/schedules/:id/items/:pollutantId`, async ({ params, request }) => {
    const id = Number(params.id);
    const pollutantId = Number(params.pollutantId);
    const schedule = db.schedules.find((s) => s.id === id);
    if (!schedule) {
      return fail('측정계획을 찾을 수 없습니다.', { status: 404 });
    }
    if (isTerminalScheduleStatus(schedule.status)) {
      return fail('성적서 작성이 완료되었거나 취소된 측정계획은 수정할 수 없습니다.', { status: 409 });
    }
    if (!selectedPollutantIds(id).includes(pollutantId)) {
      return fail('이번 측정계획의 측정항목이 아닙니다.', { status: 400 });
    }

    const body = (await request.json()) as Partial<ItemCondition>;
    if (!body.cycle) {
      return fail('측정주기는 필수입니다.', { status: 400 });
    }

    itemConditionStore[id] = {
      ...itemConditionStore[id],
      [pollutantId]: {
        cycle: body.cycle,
        allowance: body.allowance ?? null,
        oxygenApplicable: Boolean(body.oxygenApplicable),
      },
    };

    return ok(buildScheduleResponse(schedule), '측정항목 정정 성공');
  }),

  // 성적서 진행 일자 수정 — 실험·분석 탭이 단독으로 소유하므로 전체 채택이다.
  // 빈 값은 지우며, 시료접수일자가 처음 입력되면 서버처럼 분석 단계로 전진시킨다.
  http.patch(`${BASE_URL}/schedules/:id/report-dates`, async ({ params, request }) => {
    const id = Number(params.id);
    const schedule = db.schedules.find((s) => s.id === id);
    if (!schedule) {
      return fail('측정계획을 찾을 수 없습니다.', { status: 404 });
    }
    if (isTerminalScheduleStatus(schedule.status)) {
      return fail('성적서 작성이 완료되었거나 취소된 측정계획은 수정할 수 없습니다.', { status: 409 });
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
      return fail('보고서 진행 일자의 순서가 올바르지 않습니다', { status: 400 });
    }

    basicInfoStore[id] = merged;

    if (!previous.receivedAt && merged.receivedAt && schedule.status === 'MEASURING') {
      schedule.status = 'ANALYZING';
    }

    return ok(buildScheduleResponse(schedule), '성적서 진행 일자 수정 성공');
  }),

  // 고객사 스냅샷 수정 — 서명란 담당자를 두 탭이 공유하므로 부분 갱신이다.
  http.patch(`${BASE_URL}/schedules/:id/tenant`, async ({ params, request }) =>
    patchBasicInfo(params.id, request, TENANT_STAFF_KEYS, '고객사 스냅샷 수정 성공')),

  // 측정팀 스냅샷 수정 — 이 회차 측정자 표기만 바꾼다.
  http.patch(`${BASE_URL}/schedules/:id/team`, async ({ params, request }) =>
    patchBasicInfo(params.id, request, TEAM_MEMBER_KEYS, '측정팀 스냅샷 수정 성공')),

  // 회차 커스텀 필드 값 저장 — 전체 채택. 빠진 키·빈 값은 지우고, 정의에 없는 키는 400.
  http.put(`${BASE_URL}/schedules/:id/custom-fields`, async ({ params, request }) => {
    const id = Number(params.id);
    const schedule = db.schedules.find((s) => s.id === id);
    if (!schedule) {
      return fail('측정계획을 찾을 수 없습니다.', { status: 404 });
    }
    if (isTerminalScheduleStatus(schedule.status)) {
      return fail('성적서 작성이 완료되었거나 취소된 측정계획은 수정할 수 없습니다.', { status: 409 });
    }

    const body = (await request.json()) as { values?: Record<string, string> };
    const values = body.values ?? {};
    const defined = definedCustomFieldKeys();
    const undefinedKeys = Object.keys(values).filter((key) => !defined.has(key)).sort();
    if (undefinedKeys.length > 0) {
      return fail(`정의되지 않은 커스텀 필드입니다. (${undefinedKeys.join(', ')})`, { status: 400 });
    }

    customFieldValueStore[id] = Object.fromEntries(
      Object.entries(values).filter(([, value]) => typeof value === 'string' && value.trim() !== ''),
    );

    return ok(buildScheduleResponse(schedule), '커스텀 필드 값 저장 성공');
  }),

  // 채취기록부 템플릿 검사 — 실제 xlsx 를 읽지는 않는다. 파일명으로 결과를 가른다:
  // 이름에 'bad' 가 있으면 대표 문제 3종을, 아니면 통과를 돌려준다(화면 배선 확인용).
  http.post(`${BASE_URL}/schedules/sampling-records/template-check`, async ({ request }) => {
    const formData = await request.formData();
    const template = formData.get('template');
    if (!(template instanceof File)) {
      return fail('템플릿 파일이 필요합니다.', { status: 400 });
    }
    if (!template.name.toLowerCase().endsWith('.xlsx')) {
      return fail('엑셀 템플릿 처리에 실패했습니다. 템플릿의 jxls 문법을 확인해 주세요.', { status: 422 });
    }

    const issues = template.name.toLowerCase().includes('bad')
      ? [
        { sheetName: 'Record', cell: 'B3', source: 'CELL', expression: 'plan.clientNmae', name: 'plan.clientNmae', type: 'UNKNOWN_PROPERTY' },
        { sheetName: 'Record', cell: 'A6', source: 'COMMENT', expression: 'pointz', name: 'pointz', type: 'UNKNOWN_ROOT' },
        { sheetName: 'Record', cell: 'D2', source: 'CELL', expression: 'custom.siteCod', name: 'custom.siteCod', type: 'UNKNOWN_CUSTOM_KEY' },
        { sheetName: 'Notes', cell: null, source: null, expression: null, name: 'jx:area', type: 'AREA_MISSING' },
      ]
      : [];

    return ok({ valid: issues.length === 0, issues }, '템플릿 검사 성공');
  }),

  // 성적서 작성 완료 확정 — 전이 규칙은 프론트·서버가 공유한다(허용되지 않는 전이는 400).
  http.post(`${BASE_URL}/schedules/:id/completion`, ({ params }) => {
    const id = Number(params.id);
    const schedule = db.schedules.find((s) => s.id === id);
    if (!schedule) {
      return fail('측정계획을 찾을 수 없습니다.', { status: 404 });
    }

    if (!canTransitionScheduleStatus(schedule.status, 'REPORT_COMPLETED')) {
      return fail('허용되지 않는 상태 변경입니다.', { status: 400 });
    }
    schedule.status = 'REPORT_COMPLETED';

    return ok(buildScheduleResponse(schedule), '측정계획 성적서 작성 완료 처리 성공');
  }),

  // 취소 — 취소된 계획은 목록에 남는다(삭제와 다르다).
  http.post(`${BASE_URL}/schedules/:id/cancellation`, ({ params }) => {
    const id = Number(params.id);
    const schedule = db.schedules.find((s) => s.id === id);
    if (!schedule) {
      return fail('측정계획을 찾을 수 없습니다.', { status: 404 });
    }

    if (!canTransitionScheduleStatus(schedule.status, 'CANCELED')) {
      return fail('허용되지 않는 상태 변경입니다.', { status: 400 });
    }

    schedule.status = 'CANCELED';

    return ok(buildScheduleResponse(schedule), '측정계획 취소 성공');
  }),

  // 삭제(물리 삭제) — 실측 데이터가 없는 '측정예정'과 '취소'에서만 허용되며 되돌릴 수 없다.
  http.delete(`${BASE_URL}/schedules/:id`, ({ params }) => {
    const id = Number(params.id);
    const schedule = db.schedules.find((s) => s.id === id);
    if (!schedule) {
      return fail('측정계획을 찾을 수 없습니다.', { status: 404 });
    }

    if (!canDeleteSchedule(schedule.status)) {
      return fail('진행 중인 측정계획은 삭제할 수 없습니다. 취소를 사용해 주세요.', { status: 409 });
    }
    // 서버는 메타·세부 문서·실험분석정보를 함께 지운다. 목에서는 계획과 시트를 지운다.
    db.schedules = db.schedules.filter((s) => s.id !== id);
    delete sheetStore[id];

    return ok(null, '측정계획 삭제 성공');
  }),

  // 재개방 — 완료·취소를 되돌린다. 돌아갈 단계는 저장된 데이터에서 재도출한다.
  http.post(`${BASE_URL}/schedules/:id/reopen`, ({ params }) => {
    const id = Number(params.id);
    const schedule = db.schedules.find((s) => s.id === id);
    if (!schedule) {
      return fail('측정계획을 찾을 수 없습니다.', { status: 404 });
    }

    if (!canReopenSchedule(schedule.status)) {
      return fail('완료되었거나 취소된 측정계획만 재개방할 수 있습니다.', { status: 409 });
    }

    schedule.status = deriveProgress(schedule.id);

    return ok(buildScheduleResponse(schedule), '측정계획 재개방 성공');
  }),

  // 등록 (동일 시설·팀·측정일 중복 시 409)
  http.post(`${BASE_URL}/schedules`, async ({ request }) => {
    const body = await request.json() as Partial<MockSchedule>;

    const duplicated = db.schedules.some(
      (s) => s.stackId === body.stackId
        && s.teamId === body.teamId
        && s.sampledAt === body.sampledAt,
    );
    if (duplicated) {
      return fail('이미 등록된 측정계획입니다. (동일 시설·팀·측정일)', { status: 409 });
    }

    const created: MockSchedule = {
      id: Math.max(0, ...db.schedules.map((s) => s.id)) + 1,
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
    db.schedules = [created, ...db.schedules];
    return ok(created, '측정계획 등록 성공', { status: 201 });
  }),
];
