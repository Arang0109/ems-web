import type {
  Equipment,
  ParticleSamplerSpec,
  GasSamplerSpec,
  PitotTubeSpec,
  NozzleSpec,
} from "@entities/equipment";
import type { InspectionType } from "@shared/model";
import { INSPECTION_TYPE } from "@shared/model";

import { toFormValue } from "@shared/lib";

// 검사(inspection) 폼 — register-equipment와 동일 구조를 별도 소유한다(피처 간 공유 불가).
// 최종 수검일·다음 예정일은 검사 실시 기록 API가 갱신하므로 수정 폼에서는 읽기 전용이다.
export type InspectionItemForm = {
  type: InspectionType;
  enabled: boolean;
  cycleMonths: string;
  lastInspectedAt: string;   // 읽기 전용 표시 + 되돌려 보내기용
  nextDueDate: string;       // 서버 계산값 (표시 전용)
  notificationEnabled: boolean;
};

// 사양(spec) 폼 — register-equipment와 동일 구조(피처 간 공유 불가로 별도 소유).
export type EquipmentSpecForm = {
  totalVolume: string;
  orificeDp: string;
  yd: string;
  pitotTubeType: string;
  coefficients: { coefficient: string; velocity: string }[];
  diameters: { diameter: string }[];
};

export type EquipmentUpdateForm = {
  managementNumber: string;
  serialNumber: string;
  modelName: string;
  equipmentName: string;
  alias: string;
  price: string;
  manufacturer: string;
  originCountry: string;
  purchaseDate: string;
  remark: string;
  inspections: InspectionItemForm[];
  status: string;   // EquipStatus Select 값
  spec: EquipmentSpecForm;
};

const getDefaultInspectionForms = (): InspectionItemForm[] =>
  INSPECTION_TYPE.map((type) => ({
    type,
    enabled: false,
    cycleMonths: '',
    lastInspectedAt: '',
    nextDueDate: '',
    notificationEnabled: true,
  }));

// 응답 inspections(항상 3종) → 폼. 서버가 종류를 빠뜨리는 경우는 없지만,
// 폼은 항상 3종 고정 행이어야 하므로 기본 세트를 기준으로 채워 넣는다.
const toInspectionForms = (equipment: Equipment): InspectionItemForm[] =>
  getDefaultInspectionForms().map((base) => {
    const item = equipment.inspections?.find((i) => i.type === base.type);
    if (!item) return base;
    return {
      type: base.type,
      enabled: item.enabled,
      cycleMonths: toFormValue(item.cycleMonths),
      lastInspectedAt: item.lastInspectedAt ?? '',
      nextDueDate: item.nextDueDate ?? '',
      notificationEnabled: item.notificationEnabled,
    };
  });

const getDefaultSpecForm = (): EquipmentSpecForm => ({
  totalVolume: '',
  orificeDp: '',
  yd: '',
  pitotTubeType: '',
  coefficients: [],
  diameters: [],
});

// 도메인 spec(number) → 폼 spec(string). equipment.type에 따라 형태를 해석한다.
const toSpecForm = (equipment: Equipment): EquipmentSpecForm => {
  const base = getDefaultSpecForm();
  // 가스분석기는 사양이 없어 서버가 null을 내려준다.
  if (!equipment.spec) return base;

  switch (equipment.type) {
    case 'PARTICLE_SAMPLER': {
      const s = equipment.spec as ParticleSamplerSpec;
      return { ...base, totalVolume: toFormValue(s.totalVolume), orificeDp: toFormValue(s.orificeDp), yd: toFormValue(s.yd) };
    }
    case 'GAS_SAMPLER':
    case 'OTHER': {
      const s = equipment.spec as GasSamplerSpec;
      return { ...base, totalVolume: toFormValue(s.totalVolume) };
    }
    case 'PITOT_TUBE': {
      const s = equipment.spec as PitotTubeSpec;
      return {
        ...base,
        pitotTubeType: s.pitotTubeType ?? '',
        coefficients: (s.coefficients ?? []).map((c) => ({
          coefficient: toFormValue(c.coefficient),
          velocity: toFormValue(c.velocity),
        })),
      };
    }
    case 'NOZZLE': {
      const s = equipment.spec as NozzleSpec;
      return { ...base, diameters: (s.diameters ?? []).map((d) => ({ diameter: toFormValue(d.diameter) })) };
    }
    default:
      return base;
  }
};

export const getDefaultForm = (equipment: Equipment | null): EquipmentUpdateForm => {
  if (!equipment) {
    return {
      managementNumber: '', serialNumber: '', modelName: '', equipmentName: '', alias: '',
      price: '', manufacturer: '', originCountry: '', purchaseDate: '', remark: '',
      inspections: getDefaultInspectionForms(), status: '', spec: getDefaultSpecForm(),
    };
  }

  return {
    managementNumber: equipment.managementNumber ?? '',
    serialNumber: equipment.serialNumber ?? '',
    modelName: equipment.modelName ?? '',
    equipmentName: equipment.equipmentName ?? '',
    alias: equipment.alias ?? '',
    price: toFormValue(equipment.price),
    manufacturer: equipment.manufacturer ?? '',
    originCountry: equipment.originCountry ?? '',
    purchaseDate: equipment.purchaseDate ?? '',
    remark: equipment.remark ?? '',
    inspections: toInspectionForms(equipment),
    status: equipment.status,
    spec: toSpecForm(equipment),
  };
};
