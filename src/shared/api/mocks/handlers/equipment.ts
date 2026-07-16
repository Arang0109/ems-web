import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

type MockEquipment = {
  id: string;
  type: 'PARTICLE_SAMPLER' | 'GAS_SAMPLER' | 'PITOT_TUBE' | 'NOZZLE' | 'OTHER';
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
  calibrationCycle: number | null;
  lastCalibrationDate: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DELETED';
  spec: unknown;
  createdAt: string;
  modifiedAt: string;
};

const now = '2026-07-14T09:00:00';

let equipments: MockEquipment[] = [
  {
    id: '1', type: 'PARTICLE_SAMPLER', managementNumber: 'PS-001', serialNumber: 'SN-PS-001',
    modelName: 'Apex-2000', equipmentName: '입자 샘플러 A', alias: '1호기', price: 3500000,
    manufacturer: 'Ensol', originCountry: '대한민국', purchaseDate: '2024-03-10', remark: '정상 운용중',
    calibrationCycle: 12, lastCalibrationDate: '2025-03-01', status: 'ACTIVE',
    spec: { totalVolume: 1.5, orificeDp: 0.8, yd: 0.98 }, createdAt: now, modifiedAt: now,
  },
  {
    id: '2', type: 'PARTICLE_SAMPLER', managementNumber: 'PS-002', serialNumber: 'SN-PS-002',
    modelName: 'Apex-2100', equipmentName: '입자 샘플러 B', alias: '2호기', price: 3800000,
    manufacturer: 'Ensol', originCountry: '대한민국', purchaseDate: '2024-06-20', remark: '',
    calibrationCycle: 12, lastCalibrationDate: '2025-06-15', status: 'MAINTENANCE',
    spec: { totalVolume: 1.6, orificeDp: 0.82, yd: 0.97 }, createdAt: now, modifiedAt: now,
  },
  {
    id: '3', type: 'GAS_SAMPLER', managementNumber: 'GS-001', serialNumber: 'SN-GS-001',
    modelName: 'GasPro-500', equipmentName: '가스 샘플러 A', alias: '', price: 2200000,
    manufacturer: 'Horiba', originCountry: '일본', purchaseDate: '2023-11-05', remark: '',
    calibrationCycle: 6, lastCalibrationDate: '2025-05-01', status: 'ACTIVE',
    spec: { totalVolume: 2.4 }, createdAt: now, modifiedAt: now,
  },
  {
    id: '4', type: 'PITOT_TUBE', managementNumber: 'PT-001', serialNumber: 'SN-PT-001',
    modelName: 'S-Type', equipmentName: '피토관 A', alias: '', price: 450000,
    manufacturer: 'Testo', originCountry: '독일', purchaseDate: '2024-01-15', remark: '먼지 측정용',
    calibrationCycle: 24, lastCalibrationDate: '2025-01-10', status: 'ACTIVE',
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
    calibrationCycle: null, lastCalibrationDate: null, status: 'INACTIVE',
    spec: { diameters: [{ diameter: 6.0 }, { diameter: 8.0 }, { diameter: 10.0 }] },
    createdAt: now, modifiedAt: now,
  },
  {
    id: '6', type: 'OTHER', managementNumber: 'ET-001', serialNumber: 'SN-ET-001',
    modelName: 'Multi-Meter', equipmentName: '기타 측정기 A', alias: '', price: 150000,
    manufacturer: 'Fluke', originCountry: '미국', purchaseDate: '2023-08-01', remark: '보조 장비',
    calibrationCycle: 12, lastCalibrationDate: '2025-02-20', status: 'ACTIVE',
    spec: { totalVolume: 0.5 }, createdAt: now, modifiedAt: now,
  },
];

export const equipmentHandlers = [
  // 상태 변경 (구체 경로 우선)
  http.patch(`${BASE_URL}/equipments/:equipmentId/status`, async ({ params, request }) => {
    const body = await request.json() as { status: MockEquipment['status'] };
    const target = equipments.find((e) => e.id === String(params.equipmentId));
    if (!target) {
      return HttpResponse.json({ status: false, message: '장비를 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    target.status = body.status;
    target.modifiedAt = now;
    return HttpResponse.json({ status: true, message: '장비 상태 변경 성공', data: target });
  }),

  // 상세 조회
  http.get(`${BASE_URL}/equipments/:equipmentId`, ({ params }) => {
    const target = equipments.find((e) => e.id === String(params.equipmentId) && e.status !== 'DELETED');
    if (!target) {
      return HttpResponse.json({ status: false, message: '장비를 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    return HttpResponse.json({ status: true, message: '장비 조회 성공', data: target });
  }),

  // 수정
  http.put(`${BASE_URL}/equipments/:equipmentId`, async ({ params, request }) => {
    const body = await request.json() as Partial<MockEquipment>;
    const target = equipments.find((e) => e.id === String(params.equipmentId));
    if (!target) {
      return HttpResponse.json({ status: false, message: '장비를 찾을 수 없습니다.', data: null }, { status: 404 });
    }
    Object.assign(target, body, { id: target.id, modifiedAt: now });
    return HttpResponse.json({ status: true, message: '장비 수정 성공', data: target });
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
    const data = equipments.filter(
      (e) => e.status !== 'DELETED' && (!type || e.type === type),
    );
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
      calibrationCycle: body.calibrationCycle ?? null,
      lastCalibrationDate: null,
      status: 'ACTIVE',
      spec: body.spec ?? {},
      createdAt: now,
      modifiedAt: now,
    };
    equipments = [created, ...equipments];
    return HttpResponse.json({ status: true, message: '장비 등록 성공', data: created }, { status: 201 });
  }),
];
