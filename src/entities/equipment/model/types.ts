import type {
  EquipType, EquipStatus, PitotTubeType, InspectionType, InspectionResult,
} from "@shared/model";
import type { EquipmentResponse, InspectionItemDto, InspectionRecordResponse } from "../api/dto";

export type Equipment = EquipmentResponse;

// 검사 항목 — 조회 모델은 응답 형태 그대로다(서버 계산값 nextDueDate 포함).
export type InspectionItem = InspectionItemDto;

// 검사 항목 입력 모델 — 등록/수정 시 3종 전부를 전달한다.
export type InspectionItemInput = {
  type: InspectionType;
  enabled: boolean;
  cycleMonths: number | null;
  lastInspectedAt: string | null;
  nextDueDateOverride: string | null;
  notificationEnabled: boolean;
};

export type InspectionRecord = InspectionRecordResponse;

export type InspectionRecordCreate = {
  type: InspectionType;
  inspectedAt: string;
  validUntil: string | null;
  agency: string;
  certificateNumber: string;
  result: InspectionResult | null;
  remark: string;
};

// 도메인 사양(spec) — 숫자는 number
export type ParticleSamplerSpec = {
  totalVolume: number;
  orificeDp: number;
  yd: number;
};

export type GasSamplerSpec = {
  totalVolume: number;
};

export type OtherSpec = {
  totalVolume: number;
};

export type PitotCoefficient = {
  coefficient: number;
  velocity: number;
};

export type PitotTubeSpec = {
  pitotTubeType: PitotTubeType;
  coefficients: PitotCoefficient[];
};

export type NozzleDiameter = {
  diameter: number;
};

export type NozzleSpec = {
  diameters: NozzleDiameter[];
};

export type EquipmentSpec =
  | ParticleSamplerSpec
  | GasSamplerSpec
  | OtherSpec
  | PitotTubeSpec
  | NozzleSpec;

export type EquipmentCreate = {
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
  inspections: InspectionItemInput[];
  spec: EquipmentSpec | null;   // GAS_ANALYZER 는 사양이 없다.
};

export type EquipmentUpdate = EquipmentCreate;

export type EquipmentStatusChange = {
  status: EquipStatus;
};
