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
  sampledAt: string;              // 서버 LocalDate ("yyyy-MM-dd")
  schedulePurpose: string | null;
  status: ScheduleStatus;
  referenceNumber: string | null;
  clientName: string | null;        // 스냅샷 미조립 시 null
  stackName: string | null;
  teamName: string | null;
  createdAt: string;
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
// 서버 도메인 스냅샷/기록지를 그대로 반영한다. JSON 키(대소문자)를 서버 계약과 1:1로 맞춘다.
// ─────────────────────────────────────────────────────────────

// 성적서 기본정보는 전부 최상위에 있다 — 관리번호·측정분야·측정용도와 채취일자·시료접수일·
// 분석완료일·성적서발행일이 여기 있고 문서(snapshot)에는 사본을 두지 않는다.
// 일자 넷은 수정 경로가 갈린다 — 채취일자는 PUT /schedules/{id},
// 나머지 셋은 PATCH /schedules/{id}/basic-info 가 맡는다.
export type ScheduleResponse = {
  id: number;
  tenantId: number;
  stackId: number;
  teamId: number;
  measurementField: MeasurementField;
  sampledAt: string;              // LocalDate
  receivedAt: string | null;
  analyzedAt: string | null;
  issuedAt: string | null;
  schedulePurpose: string | null;
  status: ScheduleStatus;
  referenceNumber: string | null;
  createdAt: string;
  modifiedAt: string;
  snapshot: ScheduleSnapshotDto;
};

// 문서의 저장 메타(id·scheduleId·tenantId·version)는 서버가 내려보내지 않는다.
// 메타와 겹치는 값(관리번호·측정분야·측정용도·일자 넷·상태)도 담기지 않는다 —
// 같은 값이 ScheduleResponse 최상위에 있고 그쪽이 진실의 원천이다(메타는 MySQL, 스냅샷은 사본).
//
// 장비는 팀 아래(team.equipments), 채취 기록지는 채취 정보 아래(samplingData.sheets),
// 실험분석 결과는 측정항목 안(items[].analysis)에 있다.
export type ScheduleSnapshotDto = {
  team: TeamSnapshotDto;
  tenant: TenantSnapshotDto;
  client: ClientSnapshotDto;
  samplingData: SamplingSnapshotDto;
  items: MeasurementItemSnapshotDto[];
};

// 그 회차의 현장 채취 사실 — 채취 시각·현장 담당자·채취 기록지.
// 원장에 없는 회차 고유값이라 의뢰기관(client) 스냅샷이 아니라 이 노드가 보유한다.
// 성적서 서명란 담당자(analyst·technicalManager)는 고객사 스냅샷(tenant) 소관이다.
export type SamplingSnapshotDto = {
  samplingStartedAt: string | null; // "HH:mm:ss" — 측정계획 단위 공통 채취 시각
  samplingEndedAt: string | null;
  facilityManager: string | null;   // 배출시설관리자
  samplingWitness: string | null;   // 시료채취입회자(환경기술인)
  sheets: SamplingSheetResponse[];
};

export type TeamSnapshotDto = {
  teamId: number;
  teamName: string;
  mentorName: string | null;
  menteeName: string | null;
  equipments: EquipmentSnapshotDto[];
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
  analyst: string;
  technicalManager: string;
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

/**
 * 측정항목의 실험실 분석 결과. **null 이면 아직 분석 전**이며 정상 상태다.
 *
 * 앞의 넷은 실험·분석 탭이, 뒤의 둘은 성적서 탭이 소유하며 저장 경로가 갈라져 있다
 * (PUT .../analyses/results, PUT .../analyses/sampling-times).
 */
export type AnalysisResultDto = {
  analysisValue: number | null;     // 측정분석값
  unit: string | null;              // 측정단위
  analysisMethod: string | null;    // 측정분석방법
  analysisEquipment: string | null; // 분석장비
  samplingStartedAt: string | null; // "HH:mm:ss"
  samplingEndedAt: string | null;
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
  /**
   * 채취 방법(흡착관·카트리지·흡수액 등)과 입자상/가스상 구분. `code` 와 같은 이유로 null 일 수
   * 있다 — 카탈로그 도입 이전 스냅샷과 고객사 자체 물질은 카탈로그 투영값이 비어 있다.
   * 현장채취 가스상 표의 행 구성이 이 둘로 결정되므로 소비처는 null 분기를 반드시 다뤄야 한다.
   */
  method: MeasurementMethod | null;
  phase: PollutantPhase | null;
  equipment: string;
  testMethod: string;
  cycle: MeasurementCycle;
  allowance: number | null;
  /** 측정 시점의 산소보정 적용 여부 — 측정시설 원장(stack-pollutant)에서 스냅샷된 값 */
  oxygenApplicable: boolean;
  /** 실험실 분석 결과. 판정 근거(allowance·oxygenApplicable)와 한 항목 안에 있어 둘이 갈라지지 않는다. */
  analysis: AnalysisResultDto | null;
};

// ─────────────────────────────────────────────────────────────
// 채취 기록지(SamplingSheet) — GET 응답에 포함 / PUT 요청 바디
// 서버 도메인(schedule/domain/sampling)과 1:1. 서버가 @JsonProperty 를 쓰지 않으므로
// JSON 키는 도메인 필드명 그대로다(축약 없는 서술형 이름).
//
// 읽기(응답)와 쓰기(저장 요청)의 계약이 다르므로 타입을 나눈다 — 아래 SamplingSheetResponse 참조.
// ─────────────────────────────────────────────────────────────

// 저장 요청에 실어 보내는 시트. 폼이 항상 전 블록을 채워 만들므로 블록은 non-null 이다.
export type SamplingSheetDto = {
  category: MeasurementCategory;
  // 낙관적 락 토큰(서버 소유). 저장 요청에 읽어간 값을 그대로 실어 보내면
  // 서버가 그 사이 다른 사용자가 같은 시트를 저장했는지 판정한다. 신규 시트는 null.
  version: number | null;
  weather: WeatherDataDto;
  moisture: MoistureDataDto;
  exhaustGas: ExhaustGasDataDto;
  flowRate: FlowRateDataDto | null;                    // 유량 집계 (전부 서버 계산)
  particulateSampling: ParticulateSamplingDto | null;  // 입자상 집계 (입자상 시트만)
  samplingPoints: SamplingPointDto[];
  gaseousSamplings: GaseousSamplingDto[];
  // 시트레벨 계산결과 — 규정상 요구 측정점 수 (굴뚝 치수로 서버 산출)
  samplingPointCount: number | null;
};

// 서버가 내려주는 시트. 서버 도메인(SamplingSheet)의 블록은 전부 nullable 참조라
// 값이 아니라 블록 자체가 비어서 올 수 있다 — 이전 회차 불러오기(SheetReuse)는 그 회차에만
// 유효한 기상 조건을 비우고 대기압만 남기는데, 그 대기압조차 없으면 weather: null 로 준다.
// 읽기 경로는 반드시 블록 null 을 방어해야 한다.
export type SamplingSheetResponse =
  Omit<
    SamplingSheetDto,
    "weather" | "moisture" | "exhaustGas" | "samplingPoints" | "gaseousSamplings"
  > & {
    weather: WeatherDataDto | null;
    moisture: MoistureDataDto | null;
    exhaustGas: ExhaustGasDataDto | null;
    samplingPoints: SamplingPointDto[] | null;
    gaseousSamplings: GaseousSamplingDto[] | null;
  };

export type WeatherDataDto = {
  atmosphericPressure: number | null;       // 대기압 (hPa)
  weatherCondition: WeatherCondition | null;
  temperature: number | null;
  humidity: number | null;
  windDirection: WindDirection | null;
  windSpeed: number | null;
  atmosphericPressureMmHg: number | null;   // 계산결과 (mmHg)
};

export type BeforeAfterDto = { before: number | null; after: number | null };
export type InOutDto = { in: number | null; out: number | null };

export type MoistureDataDto = {
  bottleWeight: BeforeAfterDto;              // 흡습병 무게 (g)
  gasMeterTemperature: InOutDto;             // 가스미터 온도 (°C)
  dryGasVolume: BeforeAfterDto;              // 건조가스 부피 (L)
  suctionVelocity: number | null;
  gasMeterGaugePressure: number | null;
  samplingStartTime: string | null;          // "HH:mm:ss" — 시트별 수분 채취 시각
  samplingEndTime: string | null;
  // 계산결과
  gasMeterGaugePressureMmHg: number | null;  // 가스미터 게이지압 (mmHg)
  gasMeterGaugePressureInH2O: number | null; // 가스미터 게이지압 (inchH₂O)
  averageGasMeterTemperature: number | null; // 가스미터 흡입 가스온도 (°C)
  sampledDryGasVolume: number | null;        // 흡입 건조가스량 (L)
  absorbedMoistureMass: number | null;       // 흡습 수분질량 (g)
  moistureRatio: number | null;              // 수분량 (%)
};

export type ExhaustGasDataDto = {
  o2Concentration: number[];
  co2Concentration: number[];
  coConcentration: number[];
  noxConcentration: number[];
  soxConcentration: number[];
  gasAnalyzerStartTime: string | null;      // "HH:mm:ss"
  thcAnalyzerStartTime: string | null;
  // 계산결과
  standardGasDensity: number | null;        // 표준상태 배출가스밀도
  o2CorrectionFactor: number | null;        // 산소보정계수
  avgO2: number | null;
  avgCo2: number | null;
  avgCo: number | null;
  avgNox: number | null;
  avgSox: number | null;
};

// 유량 집계 — 전부 서버 계산 결과
// (averageGasTemperature(°C)는 현재 서버가 채우지 않아 항상 null이다)
export type FlowRateDataDto = {
  averageGasTemperature: number | null;       // 배출가스 온도 (°C)
  averageGasTemperatureKelvin: number | null; // 배출가스 절대온도 (K)
  averageDynamicPressure: number | null;      // 평균 동압
  averageStaticPressure: number | null;       // 평균 정압
  gasDensity: number | null;                  // 현장조건 배출가스 밀도
  stackArea: number | null;                   // 측정시설 단면적 (m²)
  averageGasVelocity: number | null;          // 평균 배출가스 유속 (m/s)
  wetGasFlowRate: number | null;              // 현장 습윤 유량 (m³/h)
  standardDryGasFlowRate: number | null;      // 표준상태 건조 유량 (Sm³/h)
  appliedPitotCoefficient: number | null;     // 피토관 계수
};

// 입자상 집계 — 집계값은 서버 계산, 채취 시작/종료·여지번호는 입력 보존
export type ParticulateSamplingDto = {
  averageKFactor: number | null;
  averageOrificeDifferentialPressure: number | null;
  averageIsokineticRatio: number | null;
  appliedNozzleDiameter: number | null;
  nozzleArea: number | null;
  averageGasMeterTemperature: number | null;  // 가스미터 평균 절대온도 (K)
  totalDryGasVolume: number | null;           // 총 건식가스미터 채취량
  totalSamplingTime: number | null;
  samplingStartedAt: string | null;           // "HH:mm:ss"
  samplingEndedAt: string | null;
  thimbleFilter: string;
  bgThimbleFilter: string;
};

// 등속흡인 가스미터 온도(°C). average는 계산결과.
export type GasMeterTemperatureDto = {
  inlet: number | null;
  outlet: number | null;
  average: number | null;
};

export type GasMeterVolumeDto = { before: number | null; after: number | null };

// 등속흡인 채취 정보 — 입자상 시트의 측정점에서만 존재
export type IsokineticSamplingDto = {
  gasTemperature: GasMeterTemperatureDto;
  gasMeterVolume: GasMeterVolumeDto;
  samplingTime: number | null;
  vacuumGaugePressure: number | null;
  finalImpingerTemperature: number | null;
  nozzleDiameter: number | null;              // 노즐경 (cm) — 입력 (측정점별)
  // 계산결과
  sampledDryGasVolume: number | null;         // 건식가스미터 채취량 (m³)
  collectedWaterVolume: number | null;        // 채취된 물의 총량 (ml)
  kFactor: number | null;
  orificeDifferentialPressure: number | null;
  isokineticRatio: number | null;             // 등속흡입계수
};

export type SamplingPointDto = {
  gasTemperature: number | null;              // 배출가스온도
  dynamicPressure: number | null;             // 동압
  staticPressure: number | null;              // 정압
  gasVelocity: number | null;                 // 유속 (계산결과)
  gasDensity: number | null;
  isokineticSampling: IsokineticSamplingDto | null; // 입자상 시트에서만
};

export type GaseousSamplingDto = {
  sampleName: string;
  samplingStartedAt: string | null;           // "HH:mm:ss"
  samplingEndedAt: string | null;
  suctionQuantity: number | null;
  gasMeterGaugePressure: number | null;
  inTemperature: number | null;
  outTemperature: number | null;
  beforeVolume: number | null;
  afterVolume: number | null;
  blankSampleNumber: string;
  sampleNumber: string;
  samplingVolume: number | null;
  /**
   * 이 시료 한 건이 담은 측정항목(pollutantId). 기록지가 알데히드류를 `VOCs` 로 통칭해 한 병에
   * 담는 관계(시료 1건 ↔ 항목 N건)를 기록한다. 통칭 규칙에서 파생되는 값처럼 보이지만, 현장에서
   * 카트리지를 두 개 써 행을 쪼개는 순간 규칙으로는 복원할 수 없는 사실이 되므로 입력값이다.
   * 구 문서와 사용자가 직접 추가한 행은 null.
   */
  pollutantIds: number[] | null;
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
  sheets: SamplingSheetDto[];
  deletedSheets: SheetRefDto[];
};

// 이전 회차 기록지 — GET /schedules/{id}/sheets/{category}/previous
// 같은 측정시설이라도 회차마다 쓰는 기록지가 다르므로, 서버는 직전 회차만 보지 않고
// 그 기록지를 실제로 쓴 최근 완료 회차를 찾아 준다.
//
// 회차 고유값(시료번호·채취 시각·기상·유량 집계·version)은 서버가 비워서 내려준다 —
// 특히 version 이 null 인 것은 옛 버전을 되돌려 보내면 저장이 409 로 거부되기 때문이다.
// 이미 서버에 있는 시트를 덮어쓸 때는 호출부가 현재 시트의 version 을 다시 넣어야 한다.
// 기상은 대기압(atmosphericPressure)만 남고 나머지 필드는 null 이다 — 대기압은 그날 날씨보다
// 굴뚝이 놓인 지역의 고도에 좌우되어 회차가 바뀌어도 크게 움직이지 않는다. 대기압이 없던 회차는
// weather 블록 자체가 null 로 온다.
//
// 불러올 기록이 없으면 응답의 data 자체가 null 이다(첫 회차이거나 그 기록지를 처음 쓰는 경우).
export type PreviousSheetResponse = {
  sourceScheduleId: number;
  sampledAt: string;                // LocalDate "yyyy-MM-dd" (출처 회차의 채취일자)
  referenceNumber: string | null;
  sheet: SamplingSheetResponse;
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
// 전달한 목록으로 전체 교체한다(부분 갱신이 아니다) — 빈 목록은 "장비 없음"이다.
// 장비 유형(입자 샘플러·가스 샘플러·피토관·노즐)은 서버가 장비 원장에서 판별하므로 지정하지 않는다.
// 장비 id는 서버 계약이 String이므로 전 레이어 string으로 유지한다.
export type ChangeScheduleEquipmentsRequest = {
  equipmentIds: string[];
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

// 담당자(배출시설관리자·시료채취입회자)는 basic-info 소관이라 이 요청에 없다.
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

// 측정항목 순서 변경 — PUT /schedules/{id}/items/order
// 배열 순서가 곧 성적서의 항목 표기 순서다. 기록부 서식은 한 장에 실리는 항목 수가 정해져 있어
// (대기측정기록부 4개) 템플릿이 items[0]~items[3] 처럼 인덱스로 칸을 지목한다.
// orderedPollutantIds 는 이 계획의 측정항목 전체여야 하며, 집합이 서버와 다르면 저장이 거절된다.
export type ReorderScheduleItemsRequest = {
  orderedPollutantIds: number[];
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

// 성적서를 진행하며 채우는 값의 수정 — PATCH /schedules/{id}/basic-info
// 값의 주인이 넷으로 갈려 있어 서버가 나눠 저장한다(일자 셋은 측정계획 메타, 채취 시각·현장
// 담당자는 채취 스냅샷, 서명란 담당자는 고객사 스냅샷, 측정자 표기는 팀 스냅샷).
// 여러 화면이 공유하는 경로라 전부 부분 갱신이다 — null 은 "미전달"이지 "지움"이 아니다.
// 계산 입력이 아니므로 서버는 측정 시트를 재계산하지 않는다.
// 시료채취 시각은 측정계획 단위(공통) 값이며, 시트별 채취시각(MoistureDataDto·
// ParticulateSamplingDto)과 다른 값이다.
export type UpdateBasicInfoRequest = {
  receivedAt: string | null;            // "yyyy-MM-dd"
  analyzedAt: string | null;
  issuedAt: string | null;
  samplingStartedAt: string | null;     // "HH:mm:ss"
  samplingEndedAt: string | null;
  facilityManager: string | null;
  samplingWitness: string | null;
  analyst: string | null;
  technicalManager: string | null;
  mentorName: string | null;            // 팀 원장은 변경하지 않고 문서 표기만 바꾼다
  menteeName: string | null;
};

// 측정계획 정의 수정 — PUT /schedules/{id}
// 채취일자·측정용도·관리번호가 이 경로다. 전달한 값을 그대로 채택하므로 빈 값은 기존 값을 지운다.
// 측정분야와 측정 대상(측정시설·측정팀)은 생성 시점에만 정하며 이 경로로 바꿀 수 없고,
// 시료접수·분석완료·성적서발행 일자는 PATCH /schedules/{id}/basic-info 가 맡는다.
export type UpdateScheduleRequest = {
  sampledAt: string;                    // "yyyy-MM-dd" — 서버 필수값(비울 수 없다)
  schedulePurpose: MeasurementType | null;
  referenceNumber: string | null;
};

// ─────────────────────────────────────────────────────────────
// 생애주기 — 완료 / 취소 / 재개방
//
// 전진(측정중·분석중)은 채취 시작시각·실측값·시료접수일 입력 시 서버가 자동 처리하므로 요청 계약이 없다.
// 완료·취소·재개방·삭제는 모두 본문이 없어 요청 타입도 없다 — 상태 변경 이력을 남기지 않으므로
// 취소·재개방 사유도 받지 않는다.
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// 실험분석정보 — /schedules/{scheduleId}/analyses
//
// 별도 애그리거트가 아니다 — 측정계획 문서의 측정항목 안(items[].analysis)에 저장되므로
// 문서 대리키가 없고 식별은 측정물질(pollutantId)로 한다. 그래서 등록·삭제 경로도 없다.
// 같은 내용을 GET /schedules/{scheduleId} 의 snapshot.items 로도 받을 수 있다.
//
// 한 항목을 두 탭이 필드를 나눠 소유한다 — 실험·분석 탭은 실험실 입력값(analysisValue·unit·
// analysisMethod·analysisEquipment)만, 성적서 탭은 채취시간(samplingStartedAt·samplingEndedAt)만
// 쓴다. 저장 경로도 갈라져 있어(PUT /results vs PUT /sampling-times) 두 탭을 동시에 열어도
// 서로의 입력을 덮어쓰지 않는다.
// ─────────────────────────────────────────────────────────────

export type AnalysisResultResponse = {
  stackPollutantId: number;
  pollutantId: number;
  pollutantName: string;
  allowance: number | null;         // 허용기준치 (측정 시점 원장 사본)
  oxygenApplicable: boolean;        // 기준산소농도 보정 적용 여부 (측정 시점 원장 사본)
  analysisValue: number | null;     // 측정분석값
  unit: string | null;              // 측정단위
  analysisMethod: string | null;    // 측정분석방법
  analysisEquipment: string | null; // 분석장비
  samplingStartedAt: string | null; // 채취 시작시각 ("HH:mm:ss") — 성적서 탭 작성분
  samplingEndedAt: string | null;   // 채취 종료시각 ("HH:mm:ss") — 성적서 탭 작성분
};

/**
 * 성적서 항목별 채취시간 일괄 저장 — PUT /schedules/{scheduleId}/analyses/sampling-times
 *
 * 전달한 항목만 갱신하며, 요청에 없는 항목의 채취시간은 서버 값이 그대로 남는다.
 * 반대로 **전달한 항목의 null 시각은 "지웠다"는 뜻**이라 기존 값을 비운다.
 * 실험실 입력값은 이 경로로 바뀌지 않는다.
 *
 * 채취시간은 현장 채취 기록지에서 자동으로 옮겨오지 않는다 — 기록지는 알데히드류를 VOCs 로
 * 통칭해 시료 한 건으로 적지만 성적서는 항목마다 따로 쓰기 때문이다(시료 1건 ↔ 항목 N건).
 */
export type SaveSamplingTimesRequest = {
  items: SamplingTimeEntryDto[];
};

/**
 * 항목별 실험분석 결과 일괄 저장 — PUT /schedules/{scheduleId}/analyses/results
 *
 * 측정물질을 키로 upsert 한다. 채취시간은 이 경로로 바뀌지 않는다(성적서 탭 소유).
 * 전달한 항목의 null 은 "기존 값 유지"가 아니라 "지움"이다.
 */
export type SaveAnalysisResultsRequest = {
  items: AnalysisResultEntryDto[];
};

export type AnalysisResultEntryDto = {
  pollutantId: number;
  analysisValue: number | null;
  unit: string | null;             // 측정단위 표기("ppm"·"mg/Sm³") — enum 값이 아니다
  analysisMethod: string | null;
  analysisEquipment: string | null;
};

export type SamplingTimeEntryDto = {
  pollutantId: number;
  samplingStartedAt: string | null; // "HH:mm:ss"
  samplingEndedAt: string | null;
};
