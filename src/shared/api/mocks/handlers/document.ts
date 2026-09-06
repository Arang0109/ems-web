import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

type MockDocument = {
  id: number;
  name: string;
  category: string;
  description: string;
  latestVersionNo: number;
  createdAt: string;
  modifiedAt: string;
};

type MockVersion = {
  versionNo: number;
  originalFilename: string;
  size: number;
  contentType: string;
  changeNote: string;
  uploadedBy: number;
  createdAt: string;
};

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const documentList: MockDocument[] = [
  { id: 1, name: '대기 성적서 양식',      category: 'REPORT_TEMPLATE',           description: '대기오염물질 측정 성적서 기본 양식',   latestVersionNo: 3, createdAt: '2026-01-12T09:00:00', modifiedAt: '2026-07-20T09:12:00' },
  { id: 2, name: '수질 성적서 양식',      category: 'REPORT_TEMPLATE',           description: '수질 항목 측정 성적서 양식',           latestVersionNo: 1, createdAt: '2026-02-03T09:00:00', modifiedAt: '2026-02-03T09:00:00' },
  { id: 3, name: '대기 채취기록부 양식',  category: 'SAMPLING_RECORD_TEMPLATE',  description: 'jxls 문법이 포함된 채취기록부 템플릿', latestVersionNo: 2, createdAt: '2026-02-18T09:00:00', modifiedAt: '2026-06-30T14:20:00' },
  { id: 4, name: '악취 채취기록부 양식',  category: 'SAMPLING_RECORD_TEMPLATE',  description: '',                                     latestVersionNo: 1, createdAt: '2026-03-09T09:00:00', modifiedAt: '2026-03-09T09:00:00' },
  { id: 5, name: '표준 측정대행 계약서',  category: 'CONTRACT',                  description: '연간 측정대행 표준 계약서',            latestVersionNo: 2, createdAt: '2026-01-05T09:00:00', modifiedAt: '2026-05-14T11:00:00' },
  { id: 6, name: '비밀유지 계약서',       category: 'CONTRACT',                  description: 'NDA 표준본',                           latestVersionNo: 1, createdAt: '2026-04-21T09:00:00', modifiedAt: '2026-04-21T09:00:00' },
  { id: 7, name: '측정대행업 등록증',     category: 'CERTIFICATE',               description: '관할 지자체 발급 등록증 사본',         latestVersionNo: 1, createdAt: '2026-01-30T09:00:00', modifiedAt: '2026-01-30T09:00:00' },
  { id: 8, name: 'KOLAS 인정서',          category: 'CERTIFICATE',               description: '',                                     latestVersionNo: 1, createdAt: '2026-03-27T09:00:00', modifiedAt: '2026-03-27T09:00:00' },
  { id: 9, name: '사내 업무 매뉴얼',      category: 'ETC',                       description: '측정팀 현장 업무 매뉴얼',              latestVersionNo: 2, createdAt: '2026-02-25T09:00:00', modifiedAt: '2026-07-01T16:40:00' },
  // 파일이 아직 없는 문서 — latestVersionNo === 0 방어 로직 확인용
  { id: 10, name: '장비 교정 안내문',     category: 'ETC',                       description: '초안만 등록된 문서',                   latestVersionNo: 0, createdAt: '2026-07-25T09:00:00', modifiedAt: '2026-07-25T09:00:00' },
];

// documentId → 버전 목록 (versionNo 내림차순으로 유지)
const versionStore: Record<number, MockVersion[]> = {
  1: [
    { versionNo: 3, originalFilename: '성적서_양식_v3.xlsx', size: 184320, contentType: XLSX_TYPE, changeNote: '측정항목 컬럼 추가',   uploadedBy: 1, createdAt: '2026-07-20T09:12:00' },
    { versionNo: 2, originalFilename: '성적서_양식_v2.xlsx', size: 176128, contentType: XLSX_TYPE, changeNote: '서식 오탈자 수정',     uploadedBy: 1, createdAt: '2026-04-02T10:00:00' },
    { versionNo: 1, originalFilename: '성적서_양식_v1.xlsx', size: 170000, contentType: XLSX_TYPE, changeNote: '최초 등록',            uploadedBy: 1, createdAt: '2026-01-12T09:00:00' },
  ],
  2: [
    { versionNo: 1, originalFilename: 'water-report-template.xlsx', size: 152000, contentType: XLSX_TYPE, changeNote: '최초 등록', uploadedBy: 1, createdAt: '2026-02-03T09:00:00' },
  ],
  3: [
    { versionNo: 2, originalFilename: '채취기록부_대기_v2.xlsx', size: 210944, contentType: XLSX_TYPE, changeNote: 'jxls 반복 구문 보완', uploadedBy: 4, createdAt: '2026-06-30T14:20:00' },
    { versionNo: 1, originalFilename: '채취기록부_대기_v1.xlsx', size: 198656, contentType: XLSX_TYPE, changeNote: '최초 등록',           uploadedBy: 4, createdAt: '2026-02-18T09:00:00' },
  ],
  4: [
    { versionNo: 1, originalFilename: '채취기록부_악취.xlsx', size: 143360, contentType: XLSX_TYPE, changeNote: '최초 등록', uploadedBy: 4, createdAt: '2026-03-09T09:00:00' },
  ],
  5: [
    { versionNo: 2, originalFilename: '표준계약서_2026.pdf', size: 512000, contentType: 'application/pdf', changeNote: '지체상금 조항 개정', uploadedBy: 1, createdAt: '2026-05-14T11:00:00' },
    { versionNo: 1, originalFilename: '표준계약서_2025.pdf', size: 498688, contentType: 'application/pdf', changeNote: '최초 등록',         uploadedBy: 1, createdAt: '2026-01-05T09:00:00' },
  ],
  6: [
    { versionNo: 1, originalFilename: 'nda.pdf', size: 245760, contentType: 'application/pdf', changeNote: '최초 등록', uploadedBy: 1, createdAt: '2026-04-21T09:00:00' },
  ],
  7: [
    { versionNo: 1, originalFilename: '측정대행업_등록증.pdf', size: 1048576, contentType: 'application/pdf', changeNote: '최초 등록', uploadedBy: 1, createdAt: '2026-01-30T09:00:00' },
  ],
  8: [
    { versionNo: 1, originalFilename: 'kolas-certificate.pdf', size: 890880, contentType: 'application/pdf', changeNote: '최초 등록', uploadedBy: 1, createdAt: '2026-03-27T09:00:00' },
  ],
  9: [
    { versionNo: 2, originalFilename: '현장_업무_매뉴얼_v2.pdf', size: 2359296, contentType: 'application/pdf', changeNote: '안전 수칙 보강', uploadedBy: 3, createdAt: '2026-07-01T16:40:00' },
    { versionNo: 1, originalFilename: '현장_업무_매뉴얼_v1.pdf', size: 2097152, contentType: 'application/pdf', changeNote: '최초 등록',      uploadedBy: 3, createdAt: '2026-02-25T09:00:00' },
  ],
  10: [],
};

const NOW = '2026-08-01T09:00:00';

const findDocument = (id: number) => documentList.find((d) => d.id === id);

const notFound = (message: string) =>
  HttpResponse.json({ status: false, message, data: null }, { status: 404 });

// 실제 파일 대신 텍스트 Blob을 만들고 첨부 헤더만 서버와 동일하게 맞춘다.
const fileResponse = (filename: string, contentType: string, body: string) =>
  new HttpResponse(new Blob([body], { type: contentType }), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      // 서버와 동일한 RFC 5987 형식 — parseAttachmentFilename 의 주 경로를 검증한다.
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });

export const documentHandlers = [
  // 경로 구체성: 더 구체적인 경로를 먼저 등록한다.
  http.get(`${BASE_URL}/admin/documents/:documentId/versions/:versionNo/download`, ({ params }) => {
    const id = Number(params.documentId);
    const versionNo = Number(params.versionNo);
    const version = versionStore[id]?.find((v) => v.versionNo === versionNo);

    if (!version) return notFound('존재하지 않는 문서 버전입니다.');

    return fileResponse(
      version.originalFilename,
      version.contentType,
      `mock document ${id} v${versionNo}`,
    );
  }),

  http.get(`${BASE_URL}/admin/documents/:documentId/versions`, ({ params }) => {
    const id = Number(params.documentId);
    if (!findDocument(id)) return notFound('존재하지 않는 문서입니다.');

    return HttpResponse.json({
      status: true,
      message: '문서 버전 목록 조회 성공',
      data: [...(versionStore[id] ?? [])].sort((a, b) => b.versionNo - a.versionNo),
    });
  }),

  http.post(`${BASE_URL}/admin/documents/:documentId/versions`, async ({ params, request }) => {
    const id = Number(params.documentId);
    const document = findDocument(id);
    if (!document) return notFound('존재하지 않는 문서입니다.');

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      return HttpResponse.json(
        { status: false, message: '빈 파일은 업로드할 수 없습니다.', data: null },
        { status: 400 },
      );
    }

    const changeNote = new URL(request.url).searchParams.get('changeNote') ?? '';
    const versionNo = document.latestVersionNo + 1;

    versionStore[id] = [
      {
        versionNo,
        originalFilename: file.name,
        size: file.size,
        contentType: file.type || 'application/octet-stream',
        changeNote,
        uploadedBy: 1,
        createdAt: NOW,
      },
      ...(versionStore[id] ?? []),
    ];
    document.latestVersionNo = versionNo;
    document.modifiedAt = NOW;

    return HttpResponse.json(
      { status: true, message: '문서 버전 등록 성공', data: versionNo },
      { status: 201 },
    );
  }),

  http.delete(`${BASE_URL}/admin/documents/:documentId/versions/:versionNo`, ({ params }) => {
    const id = Number(params.documentId);
    const versionNo = Number(params.versionNo);
    const document = findDocument(id);
    if (!document) return notFound('존재하지 않는 문서입니다.');

    const versions = versionStore[id] ?? [];
    // 서버와 동일하게 마지막 남은 한 개는 삭제를 막는다.
    if (versions.length <= 1) {
      return HttpResponse.json(
        { status: false, message: '마지막 남은 버전은 삭제할 수 없습니다.', data: null },
        { status: 409 },
      );
    }

    const index = versions.findIndex((v) => v.versionNo === versionNo);
    if (index < 0) return notFound('존재하지 않는 문서 버전입니다.');

    versions.splice(index, 1);
    // 최신 버전을 지운 경우에만 최신 번호를 남은 버전 중 최대값으로 내린다.
    if (document.latestVersionNo === versionNo) {
      document.latestVersionNo = Math.max(...versions.map((v) => v.versionNo));
    }
    document.modifiedAt = NOW;

    return HttpResponse.json({ status: true, message: '문서 버전 삭제 성공', data: null });
  }),

  http.get(`${BASE_URL}/admin/documents/:documentId/download`, ({ params }) => {
    const id = Number(params.documentId);
    const document = findDocument(id);
    if (!document) return notFound('존재하지 않는 문서입니다.');

    const latest = versionStore[id]?.find((v) => v.versionNo === document.latestVersionNo);
    if (!latest) return notFound('존재하지 않는 문서 버전입니다.');

    return fileResponse(latest.originalFilename, latest.contentType, `mock document ${id} latest`);
  }),

  http.get(`${BASE_URL}/admin/documents/:documentId`, ({ params }) => {
    const document = findDocument(Number(params.documentId));
    if (!document) return notFound('존재하지 않는 문서입니다.');

    return HttpResponse.json({ status: true, message: '문서 조회 성공', data: document });
  }),

  http.put(`${BASE_URL}/admin/documents/:documentId`, async ({ params, request }) => {
    const id = Number(params.documentId);
    const document = findDocument(id);
    if (!document) return notFound('존재하지 않는 문서입니다.');

    const body = await request.json() as { name?: string; category?: string; description?: string };

    if (body.name?.trim() && documentList.some((d) => d.id !== id && d.name === body.name!.trim())) {
      return HttpResponse.json(
        { status: false, message: '이미 같은 이름의 문서가 존재합니다.', data: null },
        { status: 409 },
      );
    }

    // 서버와 동일하게 null/blank는 기존값을 유지한다.
    if (body.name?.trim()) document.name = body.name.trim();
    if (body.category) document.category = body.category;
    if (body.description?.trim()) document.description = body.description.trim();
    document.modifiedAt = NOW;

    return HttpResponse.json({ status: true, message: '문서 수정 성공', data: null });
  }),

  http.delete(`${BASE_URL}/admin/documents/:documentId`, ({ params }) => {
    const id = Number(params.documentId);
    const index = documentList.findIndex((d) => d.id === id);
    if (index < 0) return notFound('존재하지 않는 문서입니다.');

    documentList.splice(index, 1);
    delete versionStore[id];

    return HttpResponse.json({ status: true, message: '문서 삭제 성공', data: null });
  }),

  http.get(`${BASE_URL}/admin/documents`, ({ request }) => {
    const category = new URL(request.url).searchParams.get('category');
    const data = documentList
      .filter((d) => !category || d.category === category)
      .sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));

    return HttpResponse.json({ status: true, message: '문서 목록 조회 성공', data });
  }),

  http.post(`${BASE_URL}/admin/documents`, async ({ request }) => {
    const formData = await request.formData();

    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      return HttpResponse.json(
        { status: false, message: '빈 파일은 업로드할 수 없습니다.', data: null },
        { status: 400 },
      );
    }

    const name = String(formData.get('name') ?? '').trim();
    if (documentList.some((d) => d.name === name)) {
      return HttpResponse.json(
        { status: false, message: '이미 같은 이름의 문서가 존재합니다.', data: null },
        { status: 409 },
      );
    }

    const id = Math.max(...documentList.map((d) => d.id), 0) + 1;

    documentList.push({
      id,
      name,
      category: String(formData.get('category') ?? 'ETC'),
      description: String(formData.get('description') ?? ''),
      latestVersionNo: 1,
      createdAt: NOW,
      modifiedAt: NOW,
    });

    versionStore[id] = [{
      versionNo: 1,
      originalFilename: file.name,
      size: file.size,
      contentType: file.type || 'application/octet-stream',
      changeNote: String(formData.get('changeNote') ?? ''),
      uploadedBy: 1,
      createdAt: NOW,
    }];

    return HttpResponse.json({ status: true, message: '문서 등록 성공', data: id }, { status: 201 });
  }),
];
