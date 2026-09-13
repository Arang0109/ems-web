import {
  MEASUREMENT_FIELD_LABEL, GRADE_LABEL, ORIENTATION_LABEL, SHAPE_LABEL,
  EQUIP_TYPE_LABEL, EQUIP_STATUS_LABEL, PITOT_TUBE_TYPE_LABEL, MEASUREMENT_CYCLE_LABEL,
  INSPECTION_TYPE_LABEL, INSPECTION_RESULT_LABEL,
  MEASUREMENT_TYPE_LABEL, SCHEDULE_STATUS_LABEL,
  MEASUREMENT_CATEGORY_LABEL, WEATHER_CONDITION_LABEL, WIND_DIRECTION_LABEL,
  DOCUMENT_CATEGORY_LABEL, CONTRACT_AMOUNT_UNIT_LABEL,
  MEASUREMENT_METHOD_LABEL, POLLUTANT_PHASE_LABEL, MEASUREMENT_UNIT_LABEL,
} from "@shared/config";

export const CONTRACT_STATUS = ['active', 'expiringSoon', 'expired'] as const;
export const GRADE = ['TYPE_1', 'TYPE_2', 'TYPE_3', 'TYPE_4', 'TYPE_5'] as const;
export const ORIENTATION = ['VERTICAL', 'HORIZONTAL'] as const;
export const SHAPE = ['CIRCULAR', 'RECTANGULAR'] as const;
export const MEASUREMENT_FIELD = ['AIR', 'WATER', 'NOISE_VIBRATION', 'ODOR'] as const;
export const MEASUREMENT_METHOD = ['DUST', 'HEAVY_METAL', 'MERCURY', 'FIELD_MEASUREMENT', 'ABSORPTION_SOLUTION', 'ADSORPTION_TUBE', 'TEDLAR_BAG', 'CARTRIDGE'] as const;
export const POLLUTANT_PHASE = ['PARTICLE', 'GAS'] as const;
// 측정 항목 농도의 단위
export const MEASUREMENT_UNIT = ['PPM', 'MG_PER_SM3'] as const;
export const MEASUREMENT_CYCLE = ['MONTHLY','TWICE_MONTHLY','BIMONTHLY','QUARTERLY','SEMI_ANNUAL','ANNUAL'] as const;

// 측정계획(schedule) — 진행 상태 / 측정 용도
export const SCHEDULE_STATUS = ['SCHEDULED', 'MEASURING', 'ANALYZING', 'REPORT_COMPLETED', 'CANCELED'] as const;
export const MEASUREMENT_TYPE = ['SELF', 'REFERENCE'] as const;

// 측정장비(equipment) — 종류/상태/피토관 종류
export const EQUIP_TYPE = ['PARTICLE_SAMPLER', 'GAS_SAMPLER', 'GAS_ANALYZER', 'PITOT_TUBE', 'NOZZLE', 'OTHER'] as const;
export const EQUIP_STATUS = ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DELETED'] as const;
// 사용자가 변경 가능한 상태 (DELETED는 삭제 액션으로만 도달)
export const CHANGEABLE_EQUIP_STATUS = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const;
export const PITOT_TUBE_TYPE = ['DUST', 'FINE_DUST', 'MERCURY'] as const;

// 측정장비 사양(spec) 입력 항목 — 등록 폼·수정 폼·측정계획 장비 카드가 같은 이름을 써야 한다.
// 세 곳이 각자 문구를 들고 있다가 갈라졌던 자리다(적산량/총유량, ΔH@/ΔP). 라벨은
// EQUIP_SPEC_FIELD_LABEL 한 곳에서만 나온다. 사양 항목이 늘면 라벨 결정도 함께 강제된다.
export const EQUIP_SPEC_FIELD = [
  'totalVolume', 'orificeDp', 'yd',
  'pitotTubeType', 'coefficients', 'coefficient', 'velocity',
  'diameters', 'diameter',
] as const;

// 측정장비 검사(inspection) — 종류/판정. 장비는 종류 3종을 항상 전부 보유하고 대상 여부는 플래그로 표현한다.
export const INSPECTION_TYPE = ['PRECISION_INSPECTION', 'CALIBRATION', 'GENERAL_TEST'] as const;
export const INSPECTION_RESULT = ['PASS', 'FAIL'] as const;

// 측정 기록지(sheet) — 카테고리 / 기상 / 풍향
export const MEASUREMENT_CATEGORY = ['GAS', 'HEAVY_METAL', 'DUST', 'MERCURY'] as const;
export const WEATHER_CONDITION = ['CLEAR', 'CLOUDY', 'RAIN', 'SNOW'] as const;
export const WIND_DIRECTION = ['CALM', 'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'] as const;

// 문서(document) 분류 — 서버 global.common.enums.DocumentCategory 와 동일한 규격
export const DOCUMENT_CATEGORY = ['SAMPLING_RECORD_TEMPLATE', 'CONTRACT', 'CERTIFICATE', 'ETC'] as const;

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
export type MeasurementUnit = typeof MEASUREMENT_UNIT[number];
export type MeasurementCycle = typeof MEASUREMENT_CYCLE[number];
export type ScheduleStatus = typeof SCHEDULE_STATUS[number];
export type MeasurementType = typeof MEASUREMENT_TYPE[number];
export type EquipType = typeof EQUIP_TYPE[number];
export type EquipStatus = typeof EQUIP_STATUS[number];
/** 사용자가 Select 로 고를 수 있는 상태. `DELETED` 는 삭제 액션으로만 도달하므로 제외된다. */
export type ChangeableEquipStatus = typeof CHANGEABLE_EQUIP_STATUS[number];
export type PitotTubeType = typeof PITOT_TUBE_TYPE[number];
export type EquipSpecField = typeof EQUIP_SPEC_FIELD[number];
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

/**
 * 측정계획 상태에서 넘어갈 수 있는 다음 상태. 서버 `ScheduleStatus.canTransitionTo()` 와 같은 규칙으로,
 * 단계 건너뛰기와 되돌리기를 허용하지 않는다. 성적서작성완료·취소는 종단 상태다.
 *
 * 업무 단계는 측정예정 → 측정중 → 인계완료 → 분석값입력중 → 분석완료 → 성적서작성완료 6단계지만,
 * 인계완료와 분석값입력중이 같은 시점이고 분석완료와 성적서작성완료도 같은 시점이라
 * 각각 하나로 합쳐 `ANALYZING`·`REPORT_COMPLETED` 로 표현한다.
 *
 * 전진(측정중·분석값입력중)은 채취 시작시각·실측값 입력, 시료접수일 입력 시 서버가 자동으로 처리하므로,
 * 화면이 실제로 노출하는 것은 사용자가 확정하는 종료 전이(성적서작성완료·취소)뿐이다.
 * 최종 판정은 서버가 하며, 여기서는 액션 노출 여부만 판단한다.
 *
 * 종단 상태의 재개방은 이 표가 아니라 `canReopenSchedule` 이 판정한다 — 예외 경로이므로
 * 일반 전이에 섞지 않는다(서버 `ScheduleStatus.canReopen()` 과 동일한 분리).
 */
export const SCHEDULE_STATUS_TRANSITIONS: Record<ScheduleStatus, readonly ScheduleStatus[]> = {
  SCHEDULED: ['MEASURING', 'CANCELED'],
  MEASURING: ['ANALYZING', 'CANCELED'],
  ANALYZING: ['REPORT_COMPLETED', 'CANCELED'],
  REPORT_COMPLETED: [],
  CANCELED: [],
};

export const canTransitionScheduleStatus = (from: ScheduleStatus, to: ScheduleStatus): boolean =>
  SCHEDULE_STATUS_TRANSITIONS[from].includes(to);

/** 더 이상 전진하지 않는 종단 상태인지 여부. 서버 `ScheduleStatus.isTerminal()` 과 같은 규칙이다. */
export const isTerminalScheduleStatus = (status: ScheduleStatus): boolean =>
  status === 'REPORT_COMPLETED' || status === 'CANCELED';

/**
 * 종단 상태를 되돌려 다시 작업 가능하게 만들 수 있는지 여부. 서버 `ScheduleStatus.canReopen()` 과 같다.
 * 돌아갈 단계는 서버가 저장된 측정 데이터에서 재도출하므로 화면이 정하지 않는다.
 */
export const canReopenSchedule = (status: ScheduleStatus): boolean => isTerminalScheduleStatus(status);

/**
 * 재개방에 관리자 권한이 필요한 상태인지 여부. 서버 `ScheduleStatus.requiresAdminToReopen()` 과 같다.
 *
 * 성적서작성완료는 대외 확정이라 관리자만 되돌린다.
 * 취소는 실수로 걸면 이미 입력한 측정 데이터가 잠기므로 담당자가 즉시 되돌릴 수 있어야 한다.
 */
export const requiresAdminToReopenSchedule = (status: ScheduleStatus): boolean =>
  status === 'REPORT_COMPLETED';

/**
 * 측정계획을 삭제(감춤)할 수 있는지 여부. 서버 `ScheduleStatus.canDelete()` 와 같은 규칙이다.
 *
 * 삭제는 "애초에 잘못 등록됨"을 목록에서 감추는 조작이라 실측 데이터가 없는 '측정예정'에서 허용된다.
 * '취소'도 감출 수 있는데, 취소 건에는 사유를 남겨 둬야 할 것과 잘못 만들어져 지워야 할 것이
 * 섞여 있어 취소 목록에서 골라내야 하기 때문이다.
 * 진행 중(측정중·분석값입력중)인 계획은 취소를 먼저 거쳐야 한다.
 */
export const canDeleteSchedule = (status: ScheduleStatus): boolean =>
  status === 'SCHEDULED' || status === 'CANCELED';

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

export const measurementUnitOptions = MEASUREMENT_UNIT.map((unit) => ({
  value: unit,
  label: MEASUREMENT_UNIT_LABEL[unit],
}));

/**
 * 서버의 측정단위는 자유 문자열이라 예전 기록에는 enum 값이 아니라 표기('ppm')가 그대로 들어 있다.
 * Select 는 enum 값으로만 고르므로 읽어 올 때 표기를 enum 값으로 되돌린다.
 * 둘 다 아닌 값(임의 표기)은 미선택으로 둔다 — 수정 요청은 미전달 필드를 기존 값으로 유지하므로 지워지지 않는다.
 */
export const toMeasurementUnit = (raw: string | null): MeasurementUnit | '' => {
  if (!raw) return '';
  const normalized = raw.trim();
  return MEASUREMENT_UNIT.find(
    (unit) => unit === normalized || MEASUREMENT_UNIT_LABEL[unit] === normalized,
  ) ?? '';
};

/** 저장된 측정단위의 화면 표기. enum 값은 표기로 바꾸고, 그 밖의 값은 적힌 그대로 보여준다. */
export const measurementUnitText = (raw: string | null): string => {
  if (!raw) return '';
  const unit = toMeasurementUnit(raw);
  return unit ? MEASUREMENT_UNIT_LABEL[unit] : raw.trim();
};

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