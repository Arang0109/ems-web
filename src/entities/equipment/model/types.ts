import type { EquipType, EquipStatus, PitotTubeType } from "@shared/model";
import type { EquipmentResponse } from "../api/dto";

export type Equipment = EquipmentResponse;

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
  calibrationCycle: number | null;
  spec: EquipmentSpec;
};

export type EquipmentUpdate = EquipmentCreate;

export type EquipmentStatusChange = {
  status: EquipStatus;
};
