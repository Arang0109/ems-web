import type {
  EquipType, EquipStatus, PitotTubeType, InspectionType, InspectionResult,
} from "@shared/model";

// 유형별 사양(spec) DTO — 판별자 필드는 없으며 최상위 `type`으로 형태를 해석한다.
export type ParticleSamplerSpecDto = {
  totalVolume: number;
  orificeDp: number;
  yd: number;
};

export type GasSamplerSpecDto = {
  totalVolume: number;
};

export type OtherSpecDto = {
  totalVolume: number;
};

export type PitotCoefficientDto = {
  coefficient: number;
  velocity: number;
};

export type PitotTubeSpecDto = {
  pitotTubeType: PitotTubeType;
  coefficients: PitotCoefficientDto[];
};

export type NozzleDiameterDto = {
  diameter: number;
};

export type NozzleSpecDto = {
  diameters: NozzleDiameterDto[];
};

export type EquipmentSpecDto =
  | ParticleSamplerSpecDto
  | GasSamplerSpecDto
  | OtherSpecDto
  | PitotTubeSpecDto
  | NozzleSpecDto;

// 검사(inspection) 항목 — 응답에는 InspectionType 전 종류가 항상 내려온다.
// 검사 대상 여부는 목록 포함 여부가 아니라 `enabled` 로 판단한다.
export type InspectionItemDto = {
  type: InspectionType;
  typeLabel: string;                   // 서버 계산값 (표시는 프론트 라벨맵 사용)
  enabled: boolean;                    // 이 장비가 이 검사를 받는 대상인지
  cycleMonths: number | null;          // 검사 주기(개월)
  lastInspectedAt: string | null;      // 최종 수검일 (yyyy-MM-dd)
  nextDueDateOverride: string | null;  // 성적서에 명시된 유효기간 만료일
  nextDueDate: string | null;          // 다음 검사 예정일 (서버 계산값, 읽기 전용)
  notificationEnabled: boolean;        // 임박 알림 수신 여부
};

// 검사 항목 요청 — 서버는 전달한 종류만 부분 갱신하고 항목 내 null은 "미전달=기존 유지"로 본다.
// 프론트는 3종을 항상 전부 명시 전송하므로 이 시맨틱에 걸리지 않는다.
export type InspectionItemRequestDto = {
  type: InspectionType;
  enabled: boolean;
  cycleMonths: number | null;
  lastInspectedAt: string | null;
  nextDueDateOverride: string | null;
  notificationEnabled: boolean;
};

export type EquipmentResponse = {
  id: string;
  type: EquipType;
  managementNumber: string;      // 관리번호
  serialNumber: string;          // 시리얼번호
  modelName: string;             // 모델명
  equipmentName: string;         // 장비명
  alias: string;                 // 별칭
  price: number | null;          // 가격
  manufacturer: string;          // 제조사
  originCountry: string;         // 원산지
  purchaseDate: string | null;   // 구매일 (yyyy-MM-dd)
  remark: string;                // 비고
  inspections: InspectionItemDto[];     // 검사 항목 (항상 3종 전부)
  status: EquipStatus;
  spec: EquipmentSpecDto | null; // GAS_ANALYZER 는 사양이 없어 null 이다.
  createdAt: string;
  modifiedAt: string;
};

export type CreateEquipmentRequest = {
  type: EquipType;
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
  inspections: InspectionItemRequestDto[];
  spec: EquipmentSpecDto | null;
};

// 서버는 미전달(null/blank) 필드는 기존값을 유지하나, 프론트는 폼 전체 값을 전송한다.
export type UpdateEquipmentRequest = CreateEquipmentRequest;

export type ChangeEquipmentStatusRequest = {
  status: EquipStatus;
};

// 검사 실시 이력 — 한 번 기록되면 변경되지 않으므로 수정 요청 DTO가 없다.
export type RecordInspectionRequest = {
  type: InspectionType;
  inspectedAt: string;                 // 검사 실시일 (yyyy-MM-dd)
  validUntil: string | null;           // 성적서 유효기간 만료일 → 다음 예정일로 지정된다
  agency: string;                      // 검사·교정 기관
  certificateNumber: string;           // 성적서 번호
  result: InspectionResult | null;     // 판정 개념이 없는 검사는 null
  remark: string;
};

export type InspectionRecordResponse = {
  id: string;
  equipmentId: string;
  type: InspectionType;
  typeLabel: string;
  inspectedAt: string;
  validUntil: string | null;
  agency: string | null;
  certificateNumber: string | null;
  result: InspectionResult | null;
  remark: string | null;
  createdAt: string;
};
