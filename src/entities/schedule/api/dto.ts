import type {
  MeasurementField, ScheduleStatus, MeasurementType, Grade, Shape, Orientation,
  MeasurementMethod, PollutantPhase, MeasurementCycle, EquipType, PitotTubeType,
  MeasurementCategory, WeatherCondition, WindDirection, InspectionType,
} from "@shared/model";

export type ScheduleListResponse = {
  id: number;
  stackId: number;
  teamId: number;
  measurementField: MeasurementField;
  sampledAt: string;              // 서버 LocalDateTime (ISO 문자열)
  schedulePurpose: string | null;
  status: ScheduleStatus;
  referenceNumber: string | null;
  clientName: string | null;        // 스냅샷 미조립 시 null
  workplaceName: string | null;
  stackName: string | null;
  teamName: string | null;
  createdAt: string;
  deletedAt: string | null;         // 삭제된 계획 목록에서만 채워진다
  deletedBy: number | null;
  canceledAt: string | null;        // 취소된 계획 목록에서만 채워진다 (마지막 취소 시각)
  cancelReason: string | null;
};

export type CreateScheduleRequest = {
  stackId: number;
  teamId: number;
  measurementField: MeasurementField;
  sampledAt: string;              // 서버 LocalDate ("yyyy-MM-dd")
  schedulePurpose: string | null;
  referenceNumber: string | null;
  pollutantIds: number[];           // 선택된 측정항목의 pollutantId 목록
};

// ─────────────────────────────────────────────────────────────
// 상세 조회 응답 — GET /schedules/{id}
// 서버 도메인 스냅샷/시트를 그대로 반영한다. JSON 키(대소문자)를 서버 계약과 1:1로 맞춘다.
// ─────────────────────────────────────────────────────────────

export type ScheduleResponse = {
  id: number;
  tenantId: number;
  stackId: number;
  teamId: number;
  measurementField: MeasurementField;
  sampledAt: string;              // LocalDateTime
  schedulePurpose: string | null;
  status: ScheduleStatus;
  referenceNumber: string | null;
  createdAt: string;
  modifiedAt: string;
  snapshot: ScheduleSnapshotDto;
};

export type ScheduleSnapshotDto = {
  id: string;
  scheduleId: number;
  tenantId: number;
  referenceNumber: string | null;
  status: ScheduleStatus;
  basicInfo: BasicInfoDto;
  team: TeamSnapshotDto;
  client: ClientSnapshotDto;
  tenant: TenantSnapshotDto;
  equipments: EquipmentSnapshotDto[];
  items: MeasurementItemSnapshotDto[];
  sheets: MeasurementSheetResponse[];
};

// 담당자 4인은 측정계획마다 달라지는 값이라 원장(의뢰기관)이 아니라 이 스냅샷이 보유한다.
export type BasicInfoDto = {
  referenceNumber: string | null;
  facilityManager: string | null;   // 배출시설관리자
  samplingWitness: string | null;   // 시료채취입회자(환경기술인)
  analyst: string | null;           // 시료분석검사자 (성적서 발행 단계에서 채움)
  technicalManager: string | null;  // 기술책임자
  sampledAt: string;              // LocalDate "yyyy-MM-dd" (채취일자)
  receivedAt: string | null;        // 시료접수일자
  analyzedAt: string | null;        // 분석완료일자
  issuedAt: string | null;          // 성적서발행일자
  samplingStartedAt: string | null; // 채취시작시간 "HH:mm:ss"
  samplingEndedAt: string | null;   // 채취종료시간
  measurementField: MeasurementField;
  schedulePurpose: MeasurementType | null;
};

export type TeamSnapshotDto = {
  teamId: number;
  teamName: string;
  mentorUserId: number | null;
  mentorName: string | null;
  menteeUserId: number | null;
  menteeName: string | null;
  particleSamplerId: string | null;
  gasSamplerId: string | null;
  pitotTubeId: string | null;
  nozzleId: string | null;
};

export type ClientSnapshotDto = {
  clientId: number;
  name: string;
  bizNumber: string;
  representative: string;
  roadAddress: string;
  detailAddress: string;
  zipcode: string;
  email: string;
  tel: string;
  workplace: WorkplaceSnapshotDto;
};

export type TenantSnapshotDto = {
  tenantId: number;
  name: string;
  bizNumber: string;
  representative: string;
  roadAddress: string;
  detailAddress: string;
  zipcode: string;
}

export type WorkplaceSnapshotDto = {
  workplaceId: number;
  name: string;
  bizNumber: string;
  businessCategory: string;
  roadAddress: string;
  detailAddress: string;
  zipcode: string;
  grade: Grade;
  stack: StackSnapshotDto;
};

export type StackSnapshotDto = {
  stackId: number;
  field: MeasurementField;
  name: string;
  semsNumber: string;
  grade: Grade;
  mainProduct: string;
  standardOxygen: number | null;    // 기준산소농도 (계산 외부 입력) — 서버 Integer
  height: number | null;            // 치수/높이 — 서버 Double
  horizontalLength: number | null;
  verticalLength: number | null;
  shape: Shape;
  orientation: Orientation;
  facilities: FacilitySnapshotDto[];
  preventions: PreventionSnapshotDto[];
};

export type FacilitySnapshotDto = {
  facilityId: number;
  name: string;
  fuelUsage: string;
  productOutput: string;
  incinerationAmount: string;
  fuelInput: string;
  fuelType: string;
  unit: string;
};

// 대상물질은 서버에서 별도 테이블이 폐기되고 방지시설 필드로 흡수됐다.
// capacity만 숫자(Double)이고 removalEfficiency는 서버 계약이 String이다.
export type PreventionSnapshotDto = {
  preventionId: number;
  name: string;
  capacity: number | null;          // 서버 Double
  unit: string;                     // 용량의 단위(유량 단위)
  targetName: string;
  removalEfficiency: string;
};

// spec은 판별 필드가 없으므로 EquipmentSnapshotDto.type(EquipType)으로 형태를 판별한다.
export type ParticleSamplerSpecDto = { totalVolume: number; orificeDp: number; yd: number };
export type GasSamplerSpecDto = { totalVolume: number };
export type OtherSpecDto = { totalVolume: number };
export type PitotCoefficientDto = { coefficient: number; velocity: number };
export type PitotTubeSpecDto = { pitotTubeType: PitotTubeType; coefficients: PitotCoefficientDto[] };
export type NozzleDiameterDto = { diameter: number };
export type NozzleSpecDto = { diameters: NozzleDiameterDto[] };
export type EquipmentSpecDto =
  | ParticleSamplerSpecDto | GasSamplerSpecDto | OtherSpecDto | PitotTubeSpecDto | NozzleSpecDto;

// 측정 시점 스냅샷의 검사 항목. equipment 슬라이스와 동일 형태지만 entity 간 의존을 만들지 않기 위해
// spec DTO들과 같은 방식으로 여기서 별도 정의한다. 스냅샷에는 서버 계산값(nextDueDate)이 포함되지 않는다.
export type InspectionItemSnapshotDto = {
  type: InspectionType;
  enabled: boolean;
  cycleMonths: number | null;
  lastInspectedAt: string | null;       // "yyyy-MM-dd"
  nextDueDateOverride: string | null;
  notificationEnabled: boolean;
};

export type EquipmentSnapshotDto = {
  equipmentId: string;
  type: EquipType;
  managementNumber: string;
  serialNumber: string;
  modelName: string;
  equipmentName: string;
  alias: string;
  manufacturer: string;
  inspections: InspectionItemSnapshotDto[];
  spec: EquipmentSpecDto | null;
};

export type MeasurementItemSnapshotDto = {
  stackPollutantId: number;
  pollutantId: number;
  /**
   * 전역 측정물질 카탈로그 키(예: `NOX`). 모든 고객사에서 동일하므로 물질 판별에 쓴다.
   * 카탈로그 도입 이전에 만들어진 스냅샷과 고객사 자체 물질은 null 이라, 소비처는
   * null 을 허용하고 이름으로 폴백해야 한다.
   */
  code: string | null;
  nameKr: string;
  nameEn: string;
  field: MeasurementField;
  method: MeasurementMethod;
  phase: PollutantPhase;
  equipment: string;
  testMethod: string;
  cycle: MeasurementCycle;
  allowance: number | null;
  /** 측정 시점의 산소보정 적용 여부 — 측정시설 원장(stack-pollutant)에서 스냅샷된 값 */
  oxygenApplicable: boolean;
};

// ─────────────────────────────────────────────────────────────
// 측정 시트(MeasurementSheet) — GET 응답에 포함 / PUT 요청 바디
// 서버 도메인(schedule/domain/sheet)과 1:1. 계산결과 키(pa/pm_g/tm_g/vm_g/xw 등)는
// 소문자(스네이크 포함), 물리량(Ts/Pv/Ps/Vs/Vm/Vlc/kFactor/Cp)은 @JsonProperty 대문자.
//
// 읽기(응답)와 쓰기(저장 요청)의 계약이 다르므로 타입을 나눈다 — 아래 MeasurementSheetResponse 참조.
// ─────────────────────────────────────────────────────────────

// 저장 요청에 실어 보내는 시트. 폼이 항상 전 블록을 채워 만들므로 블록은 non-null 이다.
export type MeasurementSheetDto = {
  category: MeasurementCategory;
  // 낙관적 락 토큰(서버 소유). 저장 요청에 읽어간 값을 그대로 실어 보내면
  // 서버가 그 사이 다른 사용자가 같은 시트를 저장했는지 판정한다. 신규 시트는 null.
  version: number | null;
  weather: WeatherDataDto;
  moisture: MoistureDataDto;
  exhaustGas: ExhaustGasDataDto;
  quantity: QuantityDataDto | null;     // 유량 집계 (전부 서버 계산)
  particle: ParticleDataDto | null;     // 입자상 집계 (입자상 시트만)
  samplingPoints: SamplingPointDto[];
  samples: SampleDto[];
  // 시트레벨 계산결과
  samplingPointCnt: number | null;      // 규정상 요구 측정점 수 (굴뚝 치수로 서버 산출)
  avgTm: number | null;                 // 가스미터 절대온도 (K)
};

// 서버가 내려주는 시트. 서버 도메인(MeasurementSheet)의 블록은 전부 nullable 참조라
// 값이 아니라 블록 자체가 비어서 올 수 있다 — 이전 회차 불러오기(SheetReuse)는 그 회차에만
// 유효한 기상 조건을 weather: null 로 비워서 준다. 읽기 경로는 반드시 블록 null 을 방어해야 한다.
export type MeasurementSheetResponse =
  Omit<MeasurementSheetDto, "weather" | "moisture" | "exhaustGas" | "samplingPoints" | "samples"> & {
    weather: WeatherDataDto | null;
    moisture: MoistureDataDto | null;
    exhaustGas: ExhaustGasDataDto | null;
    samplingPoints: SamplingPointDto[] | null;
    samples: SampleDto[] | null;
  };

export type WeatherDataDto = {
  pressure: number | null;              // 대기압 (hPa)
  weatherCondition: WeatherCondition | null;
  temperature: number | null;
  humidity: number | null;
  windDirection: WindDirection | null;
  windSpeed: number | null;
  pa: number | null;                    // 계산결과 (mmHg)
};

export type BeforeAfterDto = { before: number | null; after: number | null };
export type InOutDto = { in: number | null; out: number | null };

export type MoistureDataDto = {
  weight: BeforeAfterDto;
  gasMeterTemperature: InOutDto;
  dryGasVolume: BeforeAfterDto;
  suctionVelocity: number | null;
  gasMeterGaugePressure: number | null;
  samplingStartTime: string | null;     // "HH:mm:ss" — 시트별 수분 채취 시각
  samplingEndTime: string | null;
  // 계산결과
  pm_g: number | null;                  // 수분측정용 가스미터 게이지압 (mmHg)
  tm_g: number | null;                  // 가스미터 흡입 가스온도 (°C)
  vm_g: number | null;                  // 흡입 건조가스량 (L)
  ma: number | null;                    // 흡습 수분질량 (g)
  xw: number | null;                    // 수분량 (%)
};

export type ExhaustGasDataDto = {
  o2Concentration: number[];
  co2Concentration: number[];
  coConcentration: number[];
  noxConcentration: number[];
  soxConcentration: number[];
  gasAnalyzerStartTime: string | null;  // "HH:mm:ss"
  thcAnalyzerStartTime: string | null;
  standardGasDensity: number | null;    // 계산결과 (표준상태 배출가스밀도)
  o2CorrectionFactor: number | null;    // 계산결과 (산소보정계수)
};

// 유량 집계 — 전부 서버 계산 결과 (avgTs는 현재 서버가 채우지 않아 항상 null)
export type QuantityDataDto = {
  avgTs: number | null;                 // 배출가스 온도 (°C)
  avgTg: number | null;                 // 배출가스 절대온도 (K)
  avgPv: number | null;                 // 평균 동압
  avgPs: number | null;                 // 평균 정압
  gasDensity: number | null;            // 현장조건 배출가스 밀도
  area: number | null;                  // 측정시설 단면적 (m²)
  Vs: number | null;                    // 평균 배출가스 유속 (m/s)
  quantity: number | null;              // 현장 습윤 유량 (m³/h)
  standardQuantity: number | null;      // 표준상태 건조 유량 (Sm³/h)
  Cp: number | null;                    // 피토관 계수
};

// 입자상 집계 — 집계값은 서버 계산, 채취 시작/종료·여지번호는 입력 보존
export type ParticleDataDto = {
  avgKFactor: number | null;
  avgOrificeDp: number | null;
  avgIsokineticRatio: number | null;
  totalVm: number | null;               // 총 건식가스미터 채취량
  totalSamplingTime: number | null;
  samplingStartTime: string | null;     // "HH:mm:ss"
  samplingEndTime: string | null;
  thimbleFilter: string;
  bgThimbleFilter: string;
};

export type EquipmentTemperatureDto = { inTm: number | null; outTm: number | null; avgTm: number | null };
export type EquipmentVolumeDto = { beforeVm: number | null; afterVm: number | null };

// 등속흡인 채취 정보 — 입자상 시트의 측정점에서만 존재
export type ParticleSamplingDto = {
  equipmentTemperature: EquipmentTemperatureDto;   // avgTm은 계산결과
  equipmentVolume: EquipmentVolumeDto;
  samplingTime: number | null;
  vacuumGaugePressure: number | null;
  finalImpingerTemperature: number | null;
  nozzleSize: number | null;            // 입력 (측정점별)
  // 계산결과
  Vm: number | null;                    // 건식가스미터 채취량 (m³)
  Vlc: number | null;                   // 채취된 물의 총량 (ml)
  kFactor: number | null;
  orificeDp: number | null;
  isokineticRatio: number | null;       // 등속흡입계수
};

export type SamplingPointDto = {
  Ts: number | null;                    // 배출가스온도
  Pv: number | null;                    // 동압
  Ps: number | null;                    // 정압
  Vs: number | null;                    // 유속 (계산결과)
  gasDensity: number | null;
  particle: ParticleSamplingDto | null; // 입자상 시트에서만
};

export type SampleDto = {
  sampleName: string;
  startTime: string | null;         // "HH:mm:ss"
  endTime: string | null;
  suctionQuantity: number | null;
  gasMeterGaugePressure: number | null;
  inTemperature: number | null;
  outTemperature: number | null;
  beforeVolume: number | null;
  afterVolume: number | null;
  blankSampleNumber: string;
  sampleNumber: string;
  samplingVolume: number | null;
};

// 시트 참조. 본문 없이 대상만 가리킬 때 쓴다(삭제).
// 삭제도 편집이므로 version 을 함께 보내 다른 사용자가 그 사이 입력한 시트를 지우지 않게 한다.
export type SheetRefDto = {
  category: MeasurementCategory;
  version: number | null;
};

// 저장 요청 — PUT /schedules/{id}/sheets
// 서버는 요청에 담긴 카테고리의 시트만 교체하고 나머지는 보관본을 유지한다.
// 그래서 시트 삭제는 deletedSheets 로 명시해야 한다 — 요청에서 빠졌다는 것만으로는
// "내가 지웠다"와 "다른 사용자가 방금 추가했다"를 구분할 수 없기 때문이다.
export type SaveSheetsRequest = {
  sheets: MeasurementSheetDto[];
  deletedSheets: SheetRefDto[];
};

// 이전 회차 기록지 — GET /schedules/{id}/sheets/{category}/previous
// 같은 측정시설이라도 회차마다 쓰는 기록지가 다르므로, 서버는 직전 회차만 보지 않고
// 그 기록지를 실제로 쓴 최근 완료 회차를 찾아 준다.
//
// 회차 고유값(시료번호·채취 시각·기상·version)은 서버가 비워서 내려준다 —
// 특히 version 이 null 인 것은 옛 버전을 되돌려 보내면 저장이 409 로 거부되기 때문이다.
// 이미 서버에 있는 시트를 덮어쓸 때는 호출부가 현재 시트의 version 을 다시 넣어야 한다.
// 기상은 필드 단위가 아니라 weather 블록 자체가 null 로 온다.
//
// 불러올 기록이 없으면 응답의 data 자체가 null 이다(첫 회차이거나 그 기록지를 처음 쓰는 경우).
export type PreviousSheetResponse = {
  sourceScheduleId: number;
  sampledAt: string;                // LocalDate "yyyy-MM-dd" (출처 회차의 채취일자)
  referenceNumber: string | null;
  sheet: MeasurementSheetResponse;
};

// 이전 회차 기록지 후보 — GET /schedules/{id}/sheets/{category}/previous/candidates
// 그 기록지를 실제로 쓴 이전 완료 회차를 채취일 내림차순으로 준다(최근 완료 10회 안에서 찾는다).
// 가장 최근 회차가 늘 좋은 출발점은 아니라서(이상 조업이었던 회차 등) 사용자가 골라 불러온다.
//
// 시트 본문은 없다 — 고른 회차는 sourceScheduleId 를 붙여 previous 로 따로 받는다.
// 불러올 기록이 없으면 빈 배열이다(PreviousSheetResponse 와 달리 data 가 null 이 아니다).
export type PreviousSheetCandidateResponse = {
  sourceScheduleId: number;
  sampledAt: string;                // LocalDate "yyyy-MM-dd"
  referenceNumber: string | null;
};

// ─────────────────────────────────────────────────────────────
// 스냅샷 수정 요청
// 두 요청 모두 null(문자열은 blank 포함)을 "기존 값 유지"로 해석한다. 값을 비울 수는 없다.
// ─────────────────────────────────────────────────────────────

// 배정 장비 교체 — PATCH /schedules/{id}/equipments
// 장비 id는 서버 계약이 String이므로 전 레이어 string으로 유지한다.
export type ChangeScheduleEquipmentsRequest = {
  particleSamplerId: string | null;
  gasSamplerId: string | null;
  pitotTubeId: string | null;
  nozzleId: string | null;
};

// 의뢰기관 스냅샷 수정 — PATCH /schedules/{id}/client
// 의뢰기관→사업장→측정시설 트리를 중첩 전달로 부분 수정한다. 전달하지 않은 필드는 서버가 기존 값을 유지한다.
// clientId/workplaceId/stackId는 원장 연결키라 요청에 없다(서버도 patch의 id를 무시한다).
// facilities/preventions는 전달 시 전체 교체(= 빈 배열이면 전부 삭제)라서,
// 실수로 보내는 일이 없도록 타입에 키 자체를 두지 않는다.
export type ChangeStackSnapshotRequestBody = {
  field: MeasurementField | null;
  name: string | null;
  semsNumber: string | null;
  grade: Grade | null;
  mainProduct: string | null;
  standardOxygen: number | null;
  height: number | null;
  horizontalLength: number | null;
  verticalLength: number | null;
  shape: Shape | null;
  orientation: Orientation | null;
};

export type ChangeWorkplaceSnapshotRequestBody = {
  name?: string | null;
  bizNumber?: string | null;
  businessCategory?: string | null;
  roadAddress?: string | null;
  detailAddress?: string | null;
  zipcode?: string | null;
  grade?: Grade | null;
  stack?: ChangeStackSnapshotRequestBody;
};

// 담당자(배출시설관리자·시료채취입회자)는 basicInfo 소관이라 이 요청에 없다.
export type ChangeClientSnapshotRequest = {
  name?: string | null;
  bizNumber?: string | null;
  representative?: string | null;
  roadAddress?: string | null;
  detailAddress?: string | null;
  zipcode?: string | null;
  email?: string | null;
  tel?: string | null;
  workplace?: ChangeWorkplaceSnapshotRequestBody;
};

// 측정항목 교체 — PATCH /schedules/{id}/items
// 이번 계획에서 측정할 물질을 전달 목록으로 전체 교체한다(부분 수정이 아니다).
// 서버는 측정시설에 등록된 항목만 허용하며, 이미 포함돼 있던 항목은 측정 시점 값을 유지한다.
export type ChangeScheduleItemsRequest = {
  pollutantIds: number[];
};

// 측정항목 정정 — PATCH /schedules/{id}/items/{pollutantId}
// 이 회차 문서에 담긴 측정항목 하나의 측정 조건만 바로잡는다(어느 물질인지는 경로가 정한다).
// 측정시설 원장(stack-pollutant)은 바뀌지 않으므로, 원장까지 고치려면 그쪽 API를 따로 호출한다.
export type UpdateScheduleItemRequest = {
  cycle: MeasurementCycle;
  /** null 이면 "미지정"으로 비운다(0 과 구분된다) */
  allowance: number | null;
  oxygenApplicable: boolean;
};

// 기본정보 스냅샷 수정 — PATCH /schedules/{id}/basic-info
// 담당자·접수/분석/발행일자·채취 시각·측정자 표기명을 부분 수정한다.
// 계산 입력이 아니므로 서버는 측정 시트를 재계산하지 않는다.
// 시료채취 시각은 측정계획 단위(공통) 값이며, 시트별 채취시각
// (MoistureDataDto/ParticleDataDto의 samplingStartTime/EndTime)과 다른 값이다.
export type UpdateBasicInfoRequest = {
  facilityManager: string | null;
  samplingWitness: string | null;
  analyst: string | null;
  technicalManager: string | null;
  receivedAt: string | null;            // "yyyy-MM-dd"
  analyzedAt: string | null;
  issuedAt: string | null;
  samplingStartedAt: string | null;     // "HH:mm:ss"
  samplingEndedAt: string | null;
  mentorName: string | null;            // 팀 원장은 변경하지 않고 문서 표기만 바꾼다
  menteeName: string | null;
};

// 측정계획 메타 수정 — PUT /schedules/{id}
// 관리번호·채취일자·측정용도·측정분야가 이 경로다(기본정보 PATCH 계약 밖이다).
// 서버는 메타를 고친 뒤 문서 스냅샷의 basicInfo 까지 같은 값으로 동기화한다.
// null 은 "기존 값 유지"다 — 단 tenant 만 예외로 그대로 덮어써지므로,
// 값을 바꿀 뜻이 없어도 호출부가 현재 스냅샷의 tenant 를 되돌려 실어야 한다.
export type UpdateScheduleRequest = {
  measurementField: MeasurementField | null;
  sampledAt: string | null;             // "yyyy-MM-dd"
  schedulePurpose: MeasurementType | null;
  referenceNumber: string | null;
  tenant: TenantSnapshotDto | null;
};

// ─────────────────────────────────────────────────────────────
// 생애주기 — 완료 / 취소 / 재개방 / 상태 이력
//
// 전진(측정중·분석중)은 채취 시작시각·실측값·시료접수일 입력 시 서버가 자동 처리하므로 요청 계약이 없다.
// 완료(POST /completion)와 복구(POST /restore)는 본문이 없고, 취소·재개방만 사유를 받는다.
// ─────────────────────────────────────────────────────────────

/** 측정계획 취소 — POST /schedules/{id}/cancellation. 서버에서 사유가 필수(@NotBlank)다. */
export type CancelScheduleRequest = {
  reason: string;
};

/** 완료 재개방 — POST /schedules/{id}/reopen (ADMIN). 서버에서 사유가 필수(@NotBlank)다. */
export type ReopenScheduleRequest = {
  reason: string;
};

// ─────────────────────────────────────────────────────────────
// 실험분석정보 — /schedules/{scheduleId}/analyses (MongoDB, 측정항목 1건 = 문서 1건)
//
// 시트(현장 실측)와 다른 애그리거트다. 허용기준치·산소보정 적용 여부는 등록 시 서버가
// 측정 시점 스냅샷(items)에서 복사하므로 요청에 담지 않으며, 수정 대상도 아니다.
// ─────────────────────────────────────────────────────────────

export type AnalysisRecordResponse = {
  id: string;                       // Mongo 문서 id
  scheduleId: number;
  stackPollutantId: number;
  pollutantId: number;
  pollutantName: string;
  allowance: number | null;         // 허용기준치 (측정 시점 원장 사본)
  oxygenApplicable: boolean;        // 기준산소농도 보정 적용 여부 (측정 시점 원장 사본)
  analysisValue: number | null;     // 측정분석값
  unit: string | null;              // 측정단위
  analysisMethod: string | null;    // 측정분석방법
  analysisEquipment: string | null; // 분석장비
  createdAt: string;
  modifiedAt: string;
};

export type CreateAnalysisRecordRequest = {
  pollutantId: number;
  analysisValue: number;
  unit: string | null;
  analysisMethod: string | null;
  analysisEquipment: string | null;
};

/** 전달하지 않은(null) 필드는 서버가 기존 값을 유지한다. 측정항목은 바꿀 수 없다. */
export type UpdateAnalysisRecordRequest = {
  analysisValue: number | null;
  unit: string | null;
  analysisMethod: string | null;
  analysisEquipment: string | null;
};
