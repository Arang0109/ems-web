import type {
  ContractStatus, Grade, Orientation, Shape, MeasurementField,
  MeasurementMethod, PollutantPhase,
} from "../model";

export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  active: '정상',
  expiringSoon: '만료 임박',
  expired: '만료',
};

export const GRADE_LABEL: Record<Grade, string> = {
  TYPE_1: '1종',
  TYPE_2: '2종',
  TYPE_3: '3종',
  TYPE_4: '4종',
  TYPE_5: '5종',
};

export const ORIENTATION_LABEL: Record<Orientation, string> = {
  VERTICAL: '수직',
  HORIZONTAL: '수평',
};

export const SHAPE_LABEL: Record<Shape, string> = {
  CIRCULAR: '원형',
  RECTANGULAR: '사각형',
};

export const MEASUREMENT_FIELD_LABEL: Record<MeasurementField, string> = {
  AIR: '대기',
  WATER: '수질',
  NOISE_VIBRATION: '소음진동',
  ODOR: '악취',
};

export const MEASUREMENT_METHOD_LABEL: Record<MeasurementMethod, string> = {
  DUST: '먼지',
  HEAVY_METAL: '중금속',
  MERCURY: '수은',
  FIELD_MEASUREMENT: '현장측정',
  ABSORPTION_SOLUTION: '흡수액',
  ADSORPTION_TUBE: '흡착관',
  TEDLAR_BAG: '테드라백',
  CARTRIDGE: '카트리지'
};

export const POLLUTANT_PHASE_LABEL: Record<PollutantPhase, string> = {
  PARTICLE: '입자상',
  GAS: '가스상'
};