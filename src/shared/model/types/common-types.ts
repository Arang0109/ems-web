import {
  MEASUREMENT_FIELD_LABEL, GRADE_LABEL, ORIENTATION_LABEL, SHAPE_LABEL,
  EQUIP_TYPE_LABEL, EQUIP_STATUS_LABEL, PITOT_TUBE_TYPE_LABEL, MEASUREMENT_CYCLE_LABEL,
  INSPECTION_TYPE_LABEL, INSPECTION_RESULT_LABEL,
  MEASUREMENT_TYPE_LABEL, SCHEDULE_STATUS_LABEL,
  MEASUREMENT_CATEGORY_LABEL, WEATHER_CONDITION_LABEL, WIND_DIRECTION_LABEL,
  DOCUMENT_CATEGORY_LABEL, CONTRACT_AMOUNT_UNIT_LABEL,
  MEASUREMENT_METHOD_LABEL, POLLUTANT_PHASE_LABEL,
} from "@shared/config";

export const CONTRACT_STATUS = ['active', 'expiringSoon', 'expired'] as const;
export const GRADE = ['TYPE_1', 'TYPE_2', 'TYPE_3', 'TYPE_4', 'TYPE_5'] as const;
export const ORIENTATION = ['VERTICAL', 'HORIZONTAL'] as const;
export const SHAPE = ['CIRCULAR', 'RECTANGULAR'] as const;
export const MEASUREMENT_FIELD = ['AIR', 'WATER', 'NOISE_VIBRATION', 'ODOR'] as const;
export const MEASUREMENT_METHOD = ['DUST', 'HEAVY_METAL', 'MERCURY', 'FIELD_MEASUREMENT', 'ABSORPTION_SOLUTION', 'ADSORPTION_TUBE', 'TEDLAR_BAG', 'CARTRIDGE'] as const;
export const POLLUTANT_PHASE = ['PARTICLE', 'GAS'] as const;
export const MEASUREMENT_CYCLE = ['MONTHLY','TWICE_MONTHLY','BIMONTHLY','QUARTERLY','SEMI_ANNUAL','ANNUAL'] as const;

// 측정계획(schedule) — 진행 상태 / 측정 용도
export const SCHEDULE_STATUS = ['SCHEDULED', 'MEASURING', 'ANALYZING', 'COMPLETED', 'CANCELED'] as const;
export const MEASUREMENT_TYPE = ['SELF', 'REFERENCE'] as const;

// 측정장비(equipment) — 종류/상태/피토관 종류
export const EQUIP_TYPE = ['PARTICLE_SAMPLER', 'GAS_SAMPLER', 'GAS_ANALYZER', 'PITOT_TUBE', 'NOZZLE', 'OTHER'] as const;
export const EQUIP_STATUS = ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DELETED'] as const;
// 사용자가 변경 가능한 상태 (DELETED는 삭제 액션으로만 도달)
export const CHANGEABLE_EQUIP_STATUS = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const;
export const PITOT_TUBE_TYPE = ['DUST', 'FINE_DUST', 'MERCURY'] as const;

// 측정장비 검사(inspection) — 종류/판정. 장비는 종류 3종을 항상 전부 보유하고 대상 여부는 플래그로 표현한다.
export const INSPECTION_TYPE = ['PRECISION_INSPECTION', 'CALIBRATION', 'GENERAL_TEST'] as const;
export const INSPECTION_RESULT = ['PASS', 'FAIL'] as const;

// 측정 기록지(sheet) — 카테고리 / 기상 / 풍향
export const MEASUREMENT_CATEGORY = ['GAS', 'HEAVY_METAL', 'DUST', 'MERCURY'] as const;
export const WEATHER_CONDITION = ['CLEAR', 'CLOUDY', 'RAIN', 'SNOW'] as const;
export const WIND_DIRECTION = ['CALM', 'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'] as const;

// 문서(document) 분류 — 서버 global.common.enums.DocumentCategory 와 동일한 규격
export const DOCUMENT_CATEGORY = ['REPORT_TEMPLATE', 'SAMPLING_RECORD_TEMPLATE', 'CONTRACT', 'CERTIFICATE', 'ETC'] as const;

// 계약(contract) — 계약금액 단위
export const CONTRACT_AMOUNT_UNIT = ['MONTH', 'QUARTER', 'SEMI_ANNUAL', 'ANNUAL', 'TOTAL'] as const;

// 고객사(tenant) — 상태 / 구독 요금제. 서버 global/common/enums 와 합의.
export const TENANT_STATUS = ['ACTIVE', 'SUSPENDED', 'INACTIVE', 'PENDING'] as const;
// INTERNAL은 개발·테스트 전용이라 발급 폼에는 노출하지 않지만(SUBSCRIPTION_PLAN_OPTIONS),
// 조회 시 서버가 반환할 수 있으므로 union·라벨맵에는 포함한다.
export const SUBSCRIPTION_PLAN = ['BASIC', 'PRO', 'ENTERPRISE', 'INTERNAL'] as const;

// tenant 범위 사용자 역할. 플랫폼 운영자(PLATFORM_ADMIN)는 entities/auth 가 별도로 관리한다.
export const USER_ROLES = ['ADMIN', 'LAB', 'FIELD'] as const;

export type ContractStatus = typeof CONTRACT_STATUS[number];
export type Grade = typeof GRADE[number];
export type Orientation = typeof ORIENTATION[number];
export type Shape = typeof SHAPE[number];
export type MeasurementField = typeof MEASUREMENT_FIELD[number];
export type MeasurementMethod = typeof MEASUREMENT_METHOD[number];
export type PollutantPhase = typeof POLLUTANT_PHASE[number];
export type MeasurementCycle = typeof MEASUREMENT_CYCLE[number];
export type ScheduleStatus = typeof SCHEDULE_STATUS[number];
export type MeasurementType = typeof MEASUREMENT_TYPE[number];
export type EquipType = typeof EQUIP_TYPE[number];
export type EquipStatus = typeof EQUIP_STATUS[number];
export type PitotTubeType = typeof PITOT_TUBE_TYPE[number];
export type InspectionType = typeof INSPECTION_TYPE[number];
export type InspectionResult = typeof INSPECTION_RESULT[number];
export type MeasurementCategory = typeof MEASUREMENT_CATEGORY[number];
export type WeatherCondition = typeof WEATHER_CONDITION[number];
export type WindDirection = typeof WIND_DIRECTION[number];
export type DocumentCategory = typeof DOCUMENT_CATEGORY[number];
export type ContractAmountUnit = typeof CONTRACT_AMOUNT_UNIT[number];
export type TenantStatus = typeof TENANT_STATUS[number];
export type SubscriptionPlan = typeof SUBSCRIPTION_PLAN[number];
export type UserRole = typeof USER_ROLES[number];

/** 고객사 발급 폼에서 선택 가능한 요금제 (INTERNAL 제외) */
export const SUBSCRIPTION_PLAN_OPTIONS = ['BASIC', 'PRO', 'ENTERPRISE'] as const satisfies readonly SubscriptionPlan[];

export const measurementFieldOptions = MEASUREMENT_FIELD.map((field) => ({
  value: field,
  label: MEASUREMENT_FIELD_LABEL[field],
}));

export const gradeOptions = GRADE.map((grade) => ({
  value: grade,
  label: GRADE_LABEL[grade]
}))

export const measurementCycleOptions = MEASUREMENT_CYCLE.map((cycle) => ({
  value: cycle,
  label: MEASUREMENT_CYCLE_LABEL[cycle],
}));

export const measurementTypeOptions = MEASUREMENT_TYPE.map((type) => ({
  value: type,
  label: MEASUREMENT_TYPE_LABEL[type],
}));

export const scheduleStatusOptions = SCHEDULE_STATUS.map((status) => ({
  value: status,
  label: SCHEDULE_STATUS_LABEL[status],
}));

export const orientationOptions = ORIENTATION.map((orientation) => ({
  value: orientation,
  label: ORIENTATION_LABEL[orientation],
}));

export const shapeOptions = SHAPE.map((shape) => ({
  value: shape,
  label: SHAPE_LABEL[shape],
}));

export const equipTypeOptions = EQUIP_TYPE.map((type) => ({
  value: type,
  label: EQUIP_TYPE_LABEL[type],
}));

export const equipStatusOptions = CHANGEABLE_EQUIP_STATUS.map((status) => ({
  value: status,
  label: EQUIP_STATUS_LABEL[status],
}));

export const pitotTubeTypeOptions = PITOT_TUBE_TYPE.map((type) => ({
  value: type,
  label: PITOT_TUBE_TYPE_LABEL[type],
}));

export const inspectionTypeOptions = INSPECTION_TYPE.map((type) => ({
  value: type,
  label: INSPECTION_TYPE_LABEL[type],
}));

export const inspectionResultOptions = INSPECTION_RESULT.map((result) => ({
  value: result,
  label: INSPECTION_RESULT_LABEL[result],
}));

export const measurementCategoryOptions = MEASUREMENT_CATEGORY.map((category) => ({
  value: category,
  label: MEASUREMENT_CATEGORY_LABEL[category],
}));

export const weatherConditionOptions = WEATHER_CONDITION.map((condition) => ({
  value: condition,
  label: WEATHER_CONDITION_LABEL[condition],
}));

export const windDirectionOptions = WIND_DIRECTION.map((direction) => ({
  value: direction,
  label: WIND_DIRECTION_LABEL[direction],
}));

export const measurementMethodOptions = MEASUREMENT_METHOD.map((method) => ({
  value: method,
  label: MEASUREMENT_METHOD_LABEL[method],
}));

export const pollutantPhaseOptions = POLLUTANT_PHASE.map((phase) => ({
  value: phase,
  label: POLLUTANT_PHASE_LABEL[phase],
}));

export const documentCategoryOptions = DOCUMENT_CATEGORY.map((category) => ({
  value: category,
  label: DOCUMENT_CATEGORY_LABEL[category],
}));

export const contractAmountUnitOptions = CONTRACT_AMOUNT_UNIT.map((unit) => ({
  value: unit,
  label: CONTRACT_AMOUNT_UNIT_LABEL[unit],
}));

export type AddressValue = {
  zipcode: string;
  roadAddress: string;
  detailAddress: string;
}