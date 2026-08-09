import type {
  ContractStatus, Grade, Orientation, Shape, MeasurementField,
  MeasurementMethod, PollutantPhase, MeasurementCycle,
  EquipType, EquipStatus, PitotTubeType, InspectionType, InspectionResult,
  ScheduleStatus, MeasurementType,
  MeasurementCategory, WeatherCondition, WindDirection,
  DocumentCategory, ContractAmountUnit, TenantStatus, SubscriptionPlan, UserRole,
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
  PARTICLE_SAMPLER: '굴뚝시료채취장치(입자상)',
  GAS_SAMPLER: '굴뚝시료채취장치(가스상)',
  GAS_ANALYZER: '대기배출가스측정기',
  PITOT_TUBE: '피토우관',
  NOZZLE: '노즐',
  OTHER: '기타',
};

// 장비 카드 제목 옆 보조 설명 — 피그마 "측정계획-측정장비" 시안의 캡션.
export const EQUIP_TYPE_DESCRIPTION: Record<EquipType, string> = {
  PARTICLE_SAMPLER: '굴뚝시료채취장치(입자상) 및 그 부속기기',
  GAS_SAMPLER: '굴뚝시료채취장치(가스상) 및 그 부속기기',
  GAS_ANALYZER: '배출가스 성분 분석장치',
  PITOT_TUBE: '유체 속도 측정장치',
  NOZZLE: '유체 흐름 제어장치',
  OTHER: '그 밖의 측정 부속기기',
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

// 측정장비 검사(inspection) — 세 종류는 배타적이지 않으며 장비는 항상 3종 전부를 보유한다.
export const INSPECTION_TYPE_LABEL: Record<InspectionType, string> = {
  PRECISION_INSPECTION: '정도검사',
  CALIBRATION: '교정',
  GENERAL_TEST: '일반시험',
};

export const INSPECTION_RESULT_LABEL: Record<InspectionResult, string> = {
  PASS: '적합',
  FAIL: '부적합',
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
export const DOCUMENT_CATEGORY_LABEL: Record<DocumentCategory, string> = {
  REPORT_TEMPLATE: '성적서 양식',
  SAMPLING_RECORD_TEMPLATE: '채취기록부 양식',
  CONTRACT: '계약서',
  CERTIFICATE: '인증서',
  ETC: '기타',
};

export const CONTRACT_AMOUNT_UNIT_LABEL: Record<ContractAmountUnit, string> = {
  MONTH: '월',
  QUARTER: '분기',
  SEMI_ANNUAL: '반기',
  ANNUAL: '연',
  TOTAL: '총액',
};

export const VAT_INCLUDED_LABEL = {
  true: '포함',
  false: '미포함',
} as const;

export const TENANT_STATUS_LABEL: Record<TenantStatus, string> = {
  ACTIVE: '운영중',
  SUSPENDED: '정지',
  INACTIVE: '비활성',
  PENDING: '대기',
};

export const SUBSCRIPTION_PLAN_LABEL: Record<SubscriptionPlan, string> = {
  BASIC: '베이직',
  PRO: '프로',
  ENTERPRISE: '엔터프라이즈',
  INTERNAL: '내부용',
};

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: '관리자',
  LAB: '실험실',
  FIELD: '측정팀',
};
