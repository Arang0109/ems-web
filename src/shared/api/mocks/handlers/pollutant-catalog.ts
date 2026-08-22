import { http, HttpResponse } from 'msw';

import { pollutantCatalog } from './pollutants';

const BASE_URL = 'http://localhost:8080/api';

/**
 * 플랫폼 운영자 전용 카탈로그 API.
 *
 * 카탈로그 store 는 `pollutants.ts` 와 **공유한다** — 여기서 물질을 추가·폐지하면
 * 고객사 목록(`GET /pollutants`)에도 그대로 반영돼야 실제 서버와 같은 흐름이 된다.
 */
export const pollutantCatalogHandlers = [
  http.get(`${BASE_URL}/platform/pollutant-catalog`, ({ request }) => {
    const url = new URL(request.url);
    const field = url.searchParams.get('field');
    // 서버 기본값과 같게 둔다 — 파라미터가 없으면 폐지된 항목을 뺀다.
    const includeInactive = url.searchParams.get('includeInactive') === 'true';

    const data = pollutantCatalog
      .filter((item) => includeInactive || item.active)
      .filter((item) => !field || item.field === field)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return HttpResponse.json({
      status: true,
      message: '측정물질 카탈로그 목록 조회 성공',
      data,
    });
  }),

  http.get(`${BASE_URL}/platform/pollutant-catalog/:catalogId`, ({ params }) => {
    const found = pollutantCatalog.find((item) => item.id === Number(params.catalogId));
    if (!found) {
      return HttpResponse.json(
        { status: false, message: '카탈로그 항목을 찾을 수 없습니다.', data: null },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      status: true,
      message: '측정물질 카탈로그 상세 조회 성공',
      data: found,
    });
  }),

  http.post(`${BASE_URL}/platform/pollutant-catalog`, async ({ request }) => {
    const body = await request.json() as Omit<(typeof pollutantCatalog)[number], 'id' | 'active'>;

    // code 는 측정분야 안에서만 유일하다 — 분야가 다르면 같은 code 를 허용한다.
    const duplicated = pollutantCatalog.some(
      (item) => item.code === body.code && item.field === body.field,
    );
    if (duplicated) {
      return HttpResponse.json(
        { status: false, message: '같은 측정분야에 이미 존재하는 코드입니다.', data: null },
        { status: 409 },
      );
    }

    const created = { ...body, id: Date.now(), active: true };
    pollutantCatalog.push(created);
    return HttpResponse.json({
      status: true,
      message: '측정물질 카탈로그 등록 성공',
      data: created,
    }, { status: 201 });
  }),

  http.put(`${BASE_URL}/platform/pollutant-catalog/:catalogId`, async ({ params, request }) => {
    const index = pollutantCatalog.findIndex((item) => item.id === Number(params.catalogId));
    if (index < 0) {
      return HttpResponse.json(
        { status: false, message: '카탈로그 항목을 찾을 수 없습니다.', data: null },
        { status: 404 },
      );
    }

    // 서버는 전달되지 않았거나 빈 문자열인 필드를 기존 값으로 유지하고, code 는 아예 받지 않는다.
    const body = await request.json() as Record<string, unknown>;
    const updated = { ...pollutantCatalog[index] };
    for (const [key, value] of Object.entries(body)) {
      if (key === 'code') continue;
      if (value === null || value === undefined || value === '') continue;
      Object.assign(updated, { [key]: value });
    }
    pollutantCatalog[index] = updated;

    return HttpResponse.json({
      status: true,
      message: '측정물질 카탈로그 수정 성공',
      data: updated,
    });
  }),

  http.patch(`${BASE_URL}/platform/pollutant-catalog/:catalogId/deactivate`, ({ params }) =>
    setActive(Number(params.catalogId), false)),

  http.patch(`${BASE_URL}/platform/pollutant-catalog/:catalogId/activate`, ({ params }) =>
    setActive(Number(params.catalogId), true)),
];

/** 폐지/해제는 응답 형태가 같아 한 곳에서 처리한다. 삭제는 없다 — 감추기만 한다. */
const setActive = (id: number, active: boolean) => {
  const index = pollutantCatalog.findIndex((item) => item.id === id);
  if (index < 0) {
    return HttpResponse.json(
      { status: false, message: '카탈로그 항목을 찾을 수 없습니다.', data: null },
      { status: 404 },
    );
  }

  pollutantCatalog[index] = { ...pollutantCatalog[index], active };
  return HttpResponse.json({
    status: true,
    message: active ? '측정물질 카탈로그 폐지 해제 성공' : '측정물질 카탈로그 폐지 성공',
    data: pollutantCatalog[index],
  });
};
