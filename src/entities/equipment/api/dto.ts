import type { EquipType, EquipStatus, PitotTubeType } from "@shared/model";

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
  calibrationCycle: number | null;      // 교정주기
  lastCalibrationDate: string | null;   // 마지막 교정일 (응답 전용)
  status: EquipStatus;
  spec: EquipmentSpecDto;
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
  calibrationCycle: number | null;
  spec: EquipmentSpecDto;
};

// 서버는 미전달(null/blank) 필드는 기존값을 유지하나, 프론트는 폼 전체 값을 전송한다.
export type UpdateEquipmentRequest = CreateEquipmentRequest;

export type ChangeEquipmentStatusRequest = {
  status: EquipStatus;
};
