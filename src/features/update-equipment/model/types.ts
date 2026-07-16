import type {
  Equipment,
  ParticleSamplerSpec,
  GasSamplerSpec,
  PitotTubeSpec,
  NozzleSpec,
} from "@entities/equipment";

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
  calibrationCycle: string;
  status: string;   // EquipStatus Select 값
  spec: EquipmentSpecForm;
};

const numToStr = (n: number | null | undefined): string => (n == null ? '' : String(n));

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
  switch (equipment.type) {
    case 'PARTICLE_SAMPLER': {
      const s = equipment.spec as ParticleSamplerSpec;
      return { ...base, totalVolume: numToStr(s.totalVolume), orificeDp: numToStr(s.orificeDp), yd: numToStr(s.yd) };
    }
    case 'GAS_SAMPLER':
    case 'OTHER': {
      const s = equipment.spec as GasSamplerSpec;
      return { ...base, totalVolume: numToStr(s.totalVolume) };
    }
    case 'PITOT_TUBE': {
      const s = equipment.spec as PitotTubeSpec;
      return {
        ...base,
        pitotTubeType: s.pitotTubeType ?? '',
        coefficients: (s.coefficients ?? []).map((c) => ({
          coefficient: numToStr(c.coefficient),
          velocity: numToStr(c.velocity),
        })),
      };
    }
    case 'NOZZLE': {
      const s = equipment.spec as NozzleSpec;
      return { ...base, diameters: (s.diameters ?? []).map((d) => ({ diameter: numToStr(d.diameter) })) };
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
      calibrationCycle: '', status: '', spec: getDefaultSpecForm(),
    };
  }

  return {
    managementNumber: equipment.managementNumber ?? '',
    serialNumber: equipment.serialNumber ?? '',
    modelName: equipment.modelName ?? '',
    equipmentName: equipment.equipmentName ?? '',
    alias: equipment.alias ?? '',
    price: numToStr(equipment.price),
    manufacturer: equipment.manufacturer ?? '',
    originCountry: equipment.originCountry ?? '',
    purchaseDate: equipment.purchaseDate ?? '',
    remark: equipment.remark ?? '',
    calibrationCycle: numToStr(equipment.calibrationCycle),
    status: equipment.status,
    spec: toSpecForm(equipment),
  };
};
