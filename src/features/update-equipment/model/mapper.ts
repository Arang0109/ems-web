import type { EquipmentUpdateForm, EquipmentSpecForm, InspectionItemForm } from "./types";
import type {
  EquipmentUpdate, EquipmentSpec, EquipmentStatusChange, InspectionItemInput,
} from "@entities/equipment";
import type { EquipType, EquipStatus, PitotTubeType } from "@shared/model";

import { trimValue, toNumber, toNumberOrNull } from "@shared/lib";

const toSpec = (type: EquipType, spec: EquipmentSpecForm): EquipmentSpec | null => {
  switch (type) {
    case 'PARTICLE_SAMPLER':
      return {
        totalVolume: toNumber(spec.totalVolume),
        orificeDp: toNumber(spec.orificeDp),
        yd: toNumber(spec.yd),
      };
    case 'GAS_SAMPLER':
    case 'OTHER':
      return { totalVolume: toNumber(spec.totalVolume) };
    case 'PITOT_TUBE':
      return {
        pitotTubeType: spec.pitotTubeType as PitotTubeType,
        coefficients: spec.coefficients.map((c) => ({
          coefficient: toNumber(c.coefficient),
          velocity: toNumber(c.velocity),
        })),
      };
    case 'NOZZLE':
      return { diameters: spec.diameters.map((d) => ({ diameter: toNumber(d.diameter) })) };
    // 가스분석기는 사양이 없다.
    case 'GAS_ANALYZER':
      return null;
    default:
      throw new Error(`알 수 없는 장비 종류: ${type}`);
  }
};

// 3종을 항상 전부 전송한다. 최종 수검일은 폼에서 읽기 전용이므로 받은 값을 그대로 되돌려 보낸다.
const toInspectionItemInputs = (forms: InspectionItemForm[]): InspectionItemInput[] =>
  forms.map((item) => ({
    type: item.type,
    enabled: item.enabled,
    cycleMonths: item.enabled ? toNumberOrNull(item.cycleMonths) : null,
    lastInspectedAt: item.lastInspectedAt || null,
    nextDueDateOverride: null,
    notificationEnabled: item.notificationEnabled,
  }));

export const toEquipmentUpdate = (type: EquipType, form: EquipmentUpdateForm): EquipmentUpdate => ({
  type,
  managementNumber: trimValue(form.managementNumber),
  serialNumber: trimValue(form.serialNumber),
  modelName: trimValue(form.modelName),
  equipmentName: trimValue(form.equipmentName),
  alias: trimValue(form.alias),
  price: toNumberOrNull(form.price),
  manufacturer: trimValue(form.manufacturer),
  originCountry: trimValue(form.originCountry),
  purchaseDate: form.purchaseDate || null,
  remark: trimValue(form.remark),
  inspections: toInspectionItemInputs(form.inspections),
  spec: toSpec(type, form.spec),
});

export const toEquipmentStatusChange = (form: EquipmentUpdateForm): EquipmentStatusChange => ({
  status: form.status as EquipStatus,
});
