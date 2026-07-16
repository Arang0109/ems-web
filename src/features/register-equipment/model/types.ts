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
  calibrationCycle: string;
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
  calibrationCycle: '',
  spec: getDefaultSpecForm(),
});
