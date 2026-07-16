import type {
  ContractStatus, Grade, Orientation, Shape, MeasurementField,
  MeasurementMethod, PollutantPhase, MeasurementCycle,
  EquipType, EquipStatus, PitotTubeType,
  ScheduleStatus, MeasurementType,
  MeasurementCategory, WeatherCondition, WindDirection,
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

export const MEASUREMENT_CYCLE_LABEL: Record<MeasurementCycle, string> = {
  MONTHLY: '월 1회',
  TWICE_MONTHLY: '월 2회',
  BIMONTHLY: '격월',
  QUARTERLY: '분기',
  SEMI_ANNUAL: '반기',
  ANNUAL: '연 1회',
};

export const SCHEDULE_STATUS_LABEL: Record<ScheduleStatus, string> = {
  SCHEDULED: '측정예정',
  MEASURING: '측정중',
  ANALYZING: '분석중',
  COMPLETED: '완료',
  CANCELED: '취소',
};

export const MEASUREMENT_TYPE_LABEL: Record<MeasurementType, string> = {
  SELF: '자가측정용',
  REFERENCE: '기타참고용',
};

export const EQUIP_TYPE_LABEL: Record<EquipType, string> = {
  PARTICLE_SAMPLER: '입자샘플러',
  GAS_SAMPLER: '가스샘플러',
  PITOT_TUBE: '피토관',
  NOZZLE: '노즐',
  OTHER: '기타',
};

export const EQUIP_STATUS_LABEL: Record<EquipStatus, string> = {
  ACTIVE: '사용가능',
  INACTIVE: '사용중지',
  MAINTENANCE: '점검중',
  DELETED: '삭제됨',
};

export const PITOT_TUBE_TYPE_LABEL: Record<PitotTubeType, string> = {
  DUST: '먼지',
  FINE_DUST: '미세먼지',
  MERCURY: '수은',
};

export const MEASUREMENT_CATEGORY_LABEL: Record<MeasurementCategory, string> = {
  GAS: '가스상',
  HEAVY_METAL: '중금속',
  DUST: '먼지',
  MERCURY: '수은',
};

export const WEATHER_CONDITION_LABEL: Record<WeatherCondition, string> = {
  CLEAR: '맑음',
  CLOUDY: '흐림',
  RAIN: '비',
  SNOW: '눈',
};

export const WIND_DIRECTION_LABEL: Record<WindDirection, string> = {
  CALM: '무풍',
  N: '북', NNE: '북북동', NE: '북동', ENE: '동북동',
  E: '동', ESE: '동남동', SE: '남동', SSE: '남남동',
  S: '남', SSW: '남남서', SW: '남서', WSW: '서남서',
  W: '서', WNW: '서북서', NW: '북서', NNW: '북북서',
};