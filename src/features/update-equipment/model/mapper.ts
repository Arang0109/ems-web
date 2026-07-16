import type { EquipmentUpdateForm, EquipmentSpecForm } from "./types";
import type { EquipmentUpdate, EquipmentSpec, EquipmentStatusChange } from "@entities/equipment";
import type { EquipType, EquipStatus, PitotTubeType } from "@shared/model";

import { trimValue, toNumber, toNumberOrNull } from "@shared/lib";

const toSpec = (type: EquipType, spec: EquipmentSpecForm): EquipmentSpec => {
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
    default:
      throw new Error(`알 수 없는 장비 종류: ${type}`);
  }
};

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
  calibrationCycle: toNumberOrNull(form.calibrationCycle),
  spec: toSpec(type, form.spec),
});

export const toEquipmentStatusChange = (form: EquipmentUpdateForm): EquipmentStatusChange => ({
  status: form.status as EquipStatus,
});
