import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

type MockInspectionType = 'PRECISION_INSPECTION' | 'CALIBRATION' | 'GENERAL_TEST';

const INSPECTION_TYPES: MockInspectionType[] = ['PRECISION_INSPECTION', 'CALIBRATION', 'GENERAL_TEST'];

const INSPECTION_TYPE_LABEL: Record<MockInspectionType, string> = {
  PRECISION_INSPECTION: '정도검사',
  CALIBRATION: '교정',
  GENERAL_TEST: '일반시험',
};

/** 서버에 저장되는 검사 항목 (계산값 nextDueDate 제외) */
type MockInspectionItem = {
  type: MockInspectionType;
  enabled: boolean;
  cycleMonths: number | null;
  lastInspectedAt: string | null;
  nextDueDateOverride: string | null;
  notificationEnabled: boolean;
};

type MockInspectionRecord = {
  id: string;
  equipmentId: string;
  type: MockInspectionType;
  typeLabel: string;
  inspectedAt: string;
  validUntil: string | null;
  agency: string | null;
  certificateNumber: string | null;
  result: 'PASS' | 'FAIL' | null;
  remark: string | null;
  createdAt: string;
};

type MockEquipment = {
  id: string;
  type: 'PARTICLE_SAMPLER' | 'GAS_SAMPLER' | 'GAS_ANALYZER' | 'PITOT_TUBE' | 'NOZZLE' | 'OTHER';
  managementNumber: string;
  serialNumber: string;
  modelName: string;
  equipmentName: string;
  alias: string;
  price: number | null;
  manufacturer: string;
  originCountry: string;
  purchaseDate: string | null;
  remark: string;
  inspections: MockInspectionItem[];
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DELETED';
  spec: unknown;
  createdAt: string;
  modifiedAt: string;
};

const now = '2026-07-14T09:00:00';

const disabled = (type: MockInspectionType): MockInspectionItem => ({
  type, enabled: false, cycleMonths: null, lastInspectedAt: null,
  nextDueDateOverride: null, notificationEnabled: true,
});

const enabled = (
  type: MockInspectionType,
  cycleMonths: number,
  lastInspectedAt: string | null,
  notificationEnabled = true,
): MockInspectionItem => ({
  type, enabled: true, cycleMonths, lastInspectedAt, nextDueDateOverride: null, notificationEnabled,
});

/** 저장된 항목을 InspectionType 전 종류로 채워 enum 선언 순서대로 반환한다(서버 정규화와 동일). */
const normalize = (items: MockInspectionItem[] | undefined): MockInspectionItem[] =>
  INSPECTION_TYPES.map((type) => items?.find((i) => i.type === type) ?? disabled(type));

/** 다음 검사 예정일 — override 우선, 없으면 최종 수검일 + 주기. 서버 InspectionItem.nextDueDate()와 동일 규칙. */
const nextDueDate = (item: MockInspectionItem): string | null => {
  if (!item.enabled) return null;
  if (item.nextDueDateOverride) return item.nextDueDateOverride;
  if (!item.lastInspectedAt || !item.cycleMonths || item.cycleMonths <= 0) return null;
  const base = new Date(item.lastInspectedAt);
  base.setMonth(base.getMonth() + item.cycleMonths);
  return base.toISOString().slice(0, 10);
};

/** 응답 직렬화 — 검사 항목에 서버 계산값(typeLabel, nextDueDate)을 붙인다. */
const toResponse = (equipment: MockEquipment) => ({
  ...equipment,
  inspections: normalize(equipment.inspections).map((item) => ({
    ...item,
    typeLabel: INSPECTION_TYPE_LABEL[item.type],
    nextDueDate: nextDueDate(item),
  })),
});

let equipments: MockEquipment[] = [
  {
    id: '1', type: 'PARTICLE_SAMPLER', managementNumber: 'PS-001', serialNumber: 'SN-PS-001',
    modelName: 'Apex-2000', equipmentName: '입자 샘플러 A', alias: '1호기', price: 3500000,
    manufacturer: 'Ensol', originCountry: '대한민국', purchaseDate: '2024-03-10', remark: '정상 운용중',
    inspections: [
      enabled('PRECISION_INSPECTION', 24, '2025-03-01'),
      enabled('CALIBRATION', 12, '2026-03-01'),
      disabled('GENERAL_TEST'),
    ],
    status: 'ACTIVE',
    spec: { totalVolume: 1.5, orificeDp: 0.8, yd: 0.98 }, createdAt: now, modifiedAt: now,
  },
  {
    id: '2', type: 'PARTICLE_SAMPLER', managementNumber: 'PS-002', serialNumber: 'SN-PS-002',
    modelName: 'Apex-2100', equipmentName: '입자 샘플러 B', alias: '2호기', price: 3800000,
    manufacturer: 'Ensol', originCountry: '대한민국', purchaseDate: '2024-06-20', remark: '',
    inspections: [
      disabled('PRECISION_INSPECTION'),
      enabled('CALIBRATION', 12, '2025-06-15', false),
      disabled('GENERAL_TEST'),
    ],
    status: 'MAINTENANCE',
    spec: { totalVolume: 1.6, orificeDp: 0.82, yd: 0.97 }, createdAt: now, modifiedAt: now,
  },
  {
    id: '3', type: 'GAS_SAMPLER', managementNumber: 'GS-001', serialNumber: 'SN-GS-001',
    modelName: 'GasPro-500', equipmentName: '가스 샘플러 A', alias: '', price: 2200000,
    manufacturer: 'Horiba', originCountry: '일본', purchaseDate: '2023-11-05', remark: '',
    inspections: [
      disabled('PRECISION_INSPECTION'),
      enabled('CALIBRATION', 6, '2026-05-01'),
      enabled('GENERAL_TEST', 12, '2026-01-20'),
    ],
    status: 'ACTIVE',
    spec: { totalVolume: 2.4 }, createdAt: now, modifiedAt: now,
  },
  {
    id: '4', type: 'PITOT_TUBE', managementNumber: 'PT-001', serialNumber: 'SN-PT-001',
    modelName: 'S-Type', equipmentName: '피토관 A', alias: '', price: 450000,
    manufacturer: 'Testo', originCountry: '독일', purchaseDate: '2024-01-15', remark: '먼지 측정용',
    inspections: [
      enabled('PRECISION_INSPECTION', 24, '2025-01-10'),
      disabled('CALIBRATION'),
      disabled('GENERAL_TEST'),
    ],
    status: 'ACTIVE',
    spec: {
      pitotTubeType: 'DUST',
      coefficients: [
        { coefficient: 0.84, velocity: 5.0 },
        { coefficient: 0.85, velocity: 10.0 },
      ],
    },
    createdAt: now, modifiedAt: now,
  },
  {
    id: '5', type: 'NOZZLE', managementNumber: 'NZ-001', serialNumber: 'SN-NZ-001',
    modelName: 'Nozzle-Set', equipmentName: '노즐 세트 A', alias: '', price: 320000,
    manufacturer: 'Ensol', originCountry: '대한민국', purchaseDate: '2024-02-28', remark: '',
    inspections: normalize([]),
    status: 'INACTIVE',
    spec: { diameters: [{ diameter: 6.0 }, { diameter: 8.0 }, { diameter: 10.0 }] },
    createdAt: now, modifiedAt: now,
  },
  {
    id: '6', type: 'OTHER', managementNumber: 'ET-001', serialNumber: 'SN-ET-001',
    modelName: 'Multi-Meter', equipmentName: '기타 측정기 A', alias: '', price: 150000,
    manufacturer: 'Fluke', originCountry: '미국', purchaseDate: '2023-08-01', remark: '보조 장비',
    inspections: [
      disabled('PRECISION_INSPECTION'),
      enabled('CALIBRATION', 12, '2026-02-20'),
      disabled('GENERAL_TEST'),
    ],
    status: 'ACTIVE',
    spec: { totalVolume: 0.5 }, createdAt: now, modifiedAt: now,
  },
  {
    id: '7', type: 'GAS_ANALYZER', managementNumber: 'GA-001', serialNumber: 'SN-GA-001',
    modelName: 'AnalyzerPro-900', equipmentName: '가스 분석기 A', alias: '', price: 7400000,
    manufacturer: 'Horiba', originCountry: '일본', purchaseDate: '2025-04-02', remark: '',
    inspections: [
      enabled('PRECISION_INSPECTION', 12, '2026-04-10'),
      enabled('CALIBRATION', 6, '2026-06-01'),
      disabled('GENERAL_TEST'),
    ],
    status: 'ACTIVE',
    // 서버가 GAS_ANALYZER 용 spec 요청 스키마를 갖고 있지 않아 사양은 항상 null 이다.
    spec: null, createdAt: now, modifiedAt: now,
  },
];

let inspectionRecords: MockInspectionRecord[] = [
  {
    id: 'ir-1', equipmentId: '1', type: 'CALIBRATION', typeLabel: '교정',
    inspectedAt: '2026-03-01', validUntil: null, agency: '한국계량측정협회',
    certificateNumber: 'CAL-2026-0031', result: 'PASS', remark: '', createdAt: now,
  },
  {
    id: 'ir-2', equipmentId: '1', type: 'PRECISION_INSPECTION', typeLabel: '정도검사',
    inspectedAt: '2025-03-01', validUntil: null, agency: '한국환경공단',
    certificateNumber: 'PI-2025-0114', result: 'PASS', remark: '', createdAt: now,
  },
];

export const equipmentHandlers = [
  // 검사 이력 (구체 경로 우선 — /:equipmentId 가 가로채지 않도록 먼저 등록)
  http.get(`${BASE_URL}/equipments/:equipmentId/inspections`, ({ params }) => {
    const data = inspectionRecords
      .filter((r) => r.equipmentId === String(params.equipmentId))
      .sort((a, b) => b.inspectedAt.localeCompare(a.inspectedAt));
    return HttpResponse.json({ status: true, message: '검사 이력 조회 성공', data });
  }),

  http.post(`${BASE_URL}/equipments/:equipmentId/inspections`, async ({ params, request }) => {
    const body = await request.json() as Omit<MockInspectionRecord, 'id' | 'equipmentId' | 'typeLabel' | 'createdAt'>;
    const equipmentId = String(params.equipmentId);
    const target = equipments.find((e) => e.id === equipmentId);
    if (!target) {
      return HttpResponse.json({ status: false, message: '존재하지 않는 장비입니다.', data: null }, { status: 404 });
    }

    const item = normalize(target.inspections).find((i) => i.type === body.type);
    if (!item?.enabled) {
      return HttpResponse.json(
        { status: false, message: '이 장비의 검사 대상이 아닌 검사 종류입니다.', data: null },
        { status: 400 },
      );
    }

    const created: MockInspectionRecord = {
      id: `ir-${Date.now()}`,
      equipmentId,
      type: body.type,
      typeLabel: INSPECTION_TYPE_LABEL[body.type],
      inspectedAt: body.inspectedAt,
      validUntil: body.validUntil ?? null,
      agency: body.agency ?? null,
      certificateNumber: body.certificateNumber ?? null,
      result: body.result ?? null,
      remark: body.remark ?? null,
      createdAt: now,
    };
    inspectionRecords = [created, ...inspectionRecords];

    // 이력을 남긴 뒤 장비의 해당 검사 항목 최종 수검일을 갱신한다(서버와 동일 순서).
    target.inspections = normalize(target.inspections).map((i) =>
      i.type === body.type
        ? { ...i, lastInspectedAt: body.inspectedAt, nextDueDateOverride: body.validUntil ?? null }
        : i,
    );
    target.modifiedAt = new Date().toISOString().slice(0, 19);

    return HttpResponse.json({ status: true, message: '검사 이력 등록 성공', data: created }, { status: 201 });
  }),

  // 상태 변경
  http.patch(`${BASE_URL}/equipments/:equipmentId/status`, async ({ params, request }) => {
    const body = await request.json() as { status: MockEquipment['status'] };
    const target = equipments.find((e) => e.id === String(params.equipmentId));
    if (!target) {
      return HttpResponse.json({ status: false, message: '장비를 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    target.status = body.status;
    target.modifiedAt = new Date().toISOString().slice(0, 19);
    return HttpResponse.json({ status: true, message: '장비 상태 변경 성공', data: toResponse(target) });
  }),

  // 상세 조회
  http.get(`${BASE_URL}/equipments/:equipmentId`, ({ params }) => {
    const target = equipments.find((e) => e.id === String(params.equipmentId) && e.status !== 'DELETED');
    if (!target) {
      return HttpResponse.json({ status: false, message: '장비를 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    return HttpResponse.json({ status: true, message: '장비 조회 성공', data: toResponse(target) });
  }),

  // 수정
  http.put(`${BASE_URL}/equipments/:equipmentId`, async ({ params, request }) => {
    const body = await request.json() as Partial<MockEquipment>;
    const target = equipments.find((e) => e.id === String(params.equipmentId));
    if (!target) {
      return HttpResponse.json({ status: false, message: '장비를 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    Object.assign(target, body, {
      id: target.id,
      inspections: normalize(body.inspections ?? target.inspections),
      modifiedAt: new Date().toISOString().slice(0, 19),
    });
    return HttpResponse.json({ status: true, message: '장비 수정 성공', data: toResponse(target) });
  }),

  // 삭제 (소프트 삭제)
  http.delete(`${BASE_URL}/equipments/:equipmentId`, ({ params }) => {
    const target = equipments.find((e) => e.id === String(params.equipmentId));
    if (target) target.status = 'DELETED';
    return HttpResponse.json({ status: true, message: `${params.equipmentId} 삭제 완료`, data: null });
  }),

  // 목록 조회 (type 필터, DELETED 제외)
  http.get(`${BASE_URL}/equipments`, ({ request }) => {
    const type = new URL(request.url).searchParams.get('type');
    const data = equipments
      .filter((e) => e.status !== 'DELETED' && (!type || e.type === type))
      .map(toResponse);
    return HttpResponse.json({ status: true, message: '장비 목록 조회 성공', data });
  }),

  // 등록
  http.post(`${BASE_URL}/equipments`, async ({ request }) => {
    const body = await request.json() as Partial<MockEquipment>;
    const created: MockEquipment = {
      id: String(Date.now()),
      type: body.type ?? 'OTHER',
      managementNumber: body.managementNumber ?? '',
      serialNumber: body.serialNumber ?? '',
      modelName: body.modelName ?? '',
      equipmentName: body.equipmentName ?? '',
      alias: body.alias ?? '',
      price: body.price ?? null,
      manufacturer: body.manufacturer ?? '',
      originCountry: body.originCountry ?? '',
      purchaseDate: body.purchaseDate ?? null,
      remark: body.remark ?? '',
      inspections: normalize(body.inspections),
      status: 'ACTIVE',
      spec: body.spec ?? null,
      createdAt: now,
      modifiedAt: now,
    };
    equipments = [created, ...equipments];
    return HttpResponse.json({ status: true, message: '장비 등록 성공', data: toResponse(created) }, { status: 201 });
  }),
];
