import type { EquipmentRegisterForm, EquipmentSpecForm, InspectionItemForm } from "./types";
import type { EquipmentCreate, EquipmentSpec, InspectionItemInput } from "@entities/equipment";
import type { EquipType, PitotTubeType } from "@shared/model";

import { trimValue, toNumber, toNumberOrNull } from "@shared/lib";

export const toEquipmentSpec = (type: EquipType, spec: EquipmentSpecForm): EquipmentSpec | null => {
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
      return {
        diameters: spec.diameters.map((d) => ({ diameter: toNumber(d.diameter) })),
      };
    // 가스분석기는 사양이 없다. 서버가 GAS_ANALYZER 용 spec 요청 스키마를 갖고 있지 않으므로 null을 보낸다.
    case 'GAS_ANALYZER':
      return null;
    default:
      throw new Error(`알 수 없는 장비 종류: ${type}`);
  }
};

// 검사 대상이 아닌 항목은 주기·수검일을 비워 보낸다. 3종을 항상 전부 전송하므로
// 서버의 "전달한 종류만 부분 갱신" 시맨틱과 무관하게 폼 상태가 그대로 반영된다.
export const toInspectionItemInputs = (forms: InspectionItemForm[]): InspectionItemInput[] =>
  forms.map((item) => ({
    type: item.type,
    enabled: item.enabled,
    cycleMonths: item.enabled ? toNumberOrNull(item.cycleMonths) : null,
    lastInspectedAt: item.enabled ? (item.lastInspectedAt || null) : null,
    nextDueDateOverride: null,
    notificationEnabled: item.notificationEnabled,
  }));

export const toEquipmentCreate = (form: EquipmentRegisterForm): EquipmentCreate => {
  const type = form.type as EquipType;
  return {
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
    spec: toEquipmentSpec(type, form.spec),
  };
};
