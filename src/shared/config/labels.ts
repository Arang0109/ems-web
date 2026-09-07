import type {
  ContractStatus, Grade, Orientation, Shape, MeasurementField,
  MeasurementMethod, PollutantPhase, MeasurementUnit, MeasurementCycle,
  EquipType, EquipStatus, PitotTubeType, EquipSpecField, InspectionType, InspectionResult,
  ScheduleStatus, MeasurementType,
  MeasurementCategory, WeatherCondition, WindDirection,
  DocumentCategory, ContractAmountUnit, TenantStatus, SubscriptionPlan, UserRole,
} from "../model";
import type { DateRangePreset } from "../lib";
import type { StatusTone } from "../ui/badges/tones";

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

/** 측정 항목 농도의 단위 표기. 값이 곧 화면 표기라 라벨을 번역하지 않는다. */
export const MEASUREMENT_UNIT_LABEL: Record<MeasurementUnit, string> = {
  PPM: 'ppm',
  MG_PER_SM3: 'mg/Sm³',
};

export const MEASUREMENT_CYCLE_LABEL: Record<MeasurementCycle, string> = {
  MONTHLY: '월 1회',
  TWICE_MONTHLY: '월 2회',
  BIMONTHLY: '격월',
  QUARTERLY: '분기',
  SEMI_ANNUAL: '반기',
  ANNUAL: '연 1회',
};

/**
 * 측정계획 상태의 화면 표기.
 * 시료를 인계받는 시점이 곧 분석값 입력의 시작이고, 분석이 끝나는 시점이 곧 성적서 작성의 완료라
 * 인계완료·분석완료는 별도 단계가 아니라 각각 아래 두 단계에 흡수돼 있다.
 */
export const SCHEDULE_STATUS_LABEL: Record<ScheduleStatus, string> = {
  SCHEDULED: '측정예정',
  MEASURING: '측정중',
  ANALYZING: '분석값입력중',
  REPORT_COMPLETED: '성적서작성완료',
  CANCELED: '취소',
};

/**
 * 측정계획 상태의 표시 톤. 목록 배지·모바일 칩·상세 헤더가 공유한다.
 *
 * 네 진행 단계에 각각 다른 색을 준다 — 회색(대기) → 앰버(현장) → 파랑(실험실) → 초록(확정).
 * 진행 단계가 여럿이라 "진행 중"을 한 색으로 묶으면 목록에서 어느 단계인지 색으로 읽히지 않고,
 * 라벨을 끝까지 읽어야만 구분된다.
 *
 * 색상만으로 구분하지 않는다는 원칙은 그대로다 — `StatusDot` 이 점과 라벨을 항상 함께 그린다.
 */
export const SCHEDULE_STATUS_TONE: Record<ScheduleStatus, StatusTone> = {
  SCHEDULED: 'pending',           // 회색 — 아직 시작 전
  MEASURING: 'active',            // 앰버 — 현장 측정 진행
  ANALYZING: 'info',              // 파랑 — 실험실 분석값 입력 진행
  REPORT_COMPLETED: 'success',    // 초록 — 성적서까지 끝남
  CANCELED: 'danger',             // 빨강 — 중단
};

export const MEASUREMENT_TYPE_LABEL: Record<MeasurementType, string> = {
  SELF: '자가측정용',
  REFERENCE: '참고용',
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

/**
 * 측정장비 사양(spec) 항목의 표시 이름 — 등록 폼이 기준이다.
 *
 * 등록 폼(`SpecStep`)·수정 폼(`SpecFields`)·측정계획 장비 카드가 각자 문구를 들고 있다가
 * 같은 값에 다른 이름이 붙었다 — `적산량`/`총유량`, `오리피스관 보정계수 (ΔH@)`/`오리피스 ΔP`.
 * 단위·기호까지 이름에 포함해 검증 메시지도 화면에 보이는 그대로 부르게 한다.
 */
export const EQUIP_SPEC_FIELD_LABEL: Record<EquipSpecField, string> = {
  totalVolume: '적산량 (m³)',
  orificeDp: '오리피스관 보정계수 (ΔH@)',
  yd: '가스미터 보정계수 (Yd)',
  pitotTubeType: '피토우관 종류',
  coefficients: '계수 목록',
  coefficient: '계수',
  velocity: '유속',
  diameters: '직경 목록 (cm)',
  diameter: '직경',
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
  CALM: '정온',
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

export const DATE_RANGE_PRESET_LABEL: Record<DateRangePreset, string> = {
  today: '오늘',
  week: '이번 주',
  month: '이번 달',
  around30: '전후 30일'
};
