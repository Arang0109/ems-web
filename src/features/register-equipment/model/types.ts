import type { InspectionType } from "@shared/model";
import { INSPECTION_TYPE } from "@shared/model";

// 검사(inspection) 폼 — 장비는 검사 종류 3종을 항상 전부 보유하고, 대상 여부는 `enabled`로 표현한다.
// `nextDueDateOverride`는 폼에 노출하지 않는다. 성적서 유효기간은 검사 실시 기록의 validUntil이 채운다.
export type InspectionItemForm = {
  type: InspectionType;
  enabled: boolean;
  cycleMonths: string;      // 숫자는 Form에서 string
  lastInspectedAt: string;  // yyyy-MM-dd
  notificationEnabled: boolean;
};

export const getDefaultInspectionForms = (): InspectionItemForm[] =>
  INSPECTION_TYPE.map((type) => ({
    type,
    enabled: false,
    cycleMonths: '',
    lastInspectedAt: '',
    notificationEnabled: true,
  }));

// 사양(spec) 폼 — 모든 숫자는 string, 유형별 필드를 한 객체로 보유(유형 전환 시 초기화).
export type EquipmentSpecForm = {
  totalVolume: string;   // 입자샘플러/가스샘플러/기타
  orificeDp: string;     // 입자샘플러
  yd: string;            // 입자샘플러
  pitotTubeType: string; // 피토관
  coefficients: { coefficient: string; velocity: string }[]; // 피토관
  diameters: { diameter: string }[];                          // 노즐
};

export type EquipmentRegisterForm = {
  type: string;   // EquipType Select 값
  managementNumber: string;
  serialNumber: string;
  modelName: string;
  equipmentName: string;
  alias: string;
  price: string;
  manufacturer: string;
  originCountry: string;
  purchaseDate: string;   // yyyy-MM-dd
  remark: string;
  inspections: InspectionItemForm[];
  spec: EquipmentSpecForm;
};

export const getDefaultSpecForm = (): EquipmentSpecForm => ({
  totalVolume: '',
  orificeDp: '',
  yd: '',
  pitotTubeType: '',
  coefficients: [],
  diameters: [],
});

export const getDefaultEquipmentRegisterForm = (type: string = ''): EquipmentRegisterForm => ({
  type,
  managementNumber: '',
  serialNumber: '',
  modelName: '',
  equipmentName: '',
  alias: '',
  price: '',
  manufacturer: '',
  originCountry: '',
  purchaseDate: '',
  remark: '',
  inspections: getDefaultInspectionForms(),
  spec: getDefaultSpecForm(),
});
