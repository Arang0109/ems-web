import type {
  MeasurementField, ScheduleStatus, MeasurementType, Grade, Shape, Orientation,
  MeasurementMethod, PollutantPhase, MeasurementCycle, EquipType, PitotTubeType,
  MeasurementCategory, WeatherCondition, WindDirection,
} from "@shared/model";

export type ScheduleListResponse = {
  id: number;
  stackId: number;
  teamId: number;
  measurementField: MeasurementField;
  measureDate: string;              // 서버 LocalDateTime (ISO 문자열)
  measurementType: string | null;
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
  measureDate: string;              // 서버 LocalDateTime
  measurementType: string | null;
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
  measureDate: string;              // LocalDateTime
  measurementType: string | null;
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
  equipments: EquipmentSnapshotDto[];
  items: MeasurementItemSnapshotDto[];
  sheets: MeasurementSheetDto[];
};

export type BasicInfoDto = {
  referenceNumber: string | null;
  measureDate: string;              // LocalDateTime
  measurementField: MeasurementField;
  measurementType: MeasurementType | null;
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
  manager: string;
  email: string;
  tel: string;
  workplace: WorkplaceSnapshotDto;
};

export type WorkplaceSnapshotDto = {
  workplaceId: number;
  name: string;
  bizNumber: string;
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
  businessCategory: string;
  mainProduct: string;
  standardOxygen: number | null;    // 기준산소농도 (계산 외부 입력)
  height: string;                   // 치수/높이 — 서버 String
  horizontalLength: string;
  verticalLength: string;
  shape: Shape;
  orientation: Orientation;
  facilities: FacilitySnapshotDto[];
  preventions: PreventionSnapshotDto[];
};

export type FacilitySnapshotDto = {
  facilityId: number;
  name: string;
  fuelUsage: string;
  fuelInput: string;
  fuelType: string;
};

export type PreventionSnapshotDto = {
  preventionId: number;
  name: string;
  targetSubstances: TargetSubstanceSnapshotDto[];
};

export type TargetSubstanceSnapshotDto = {
  targetSubstanceId: number;
  name: string;
  removalEfficiency: number | null;
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

export type EquipmentSnapshotDto = {
  equipmentId: string;
  type: EquipType;
  managementNumber: string;
  serialNumber: string;
  modelName: string;
  equipmentName: string;
  alias: string;
  manufacturer: string;
  calibrationCycle: number | null;
  lastCalibrationDate: string | null;   // "yyyy-MM-dd"
  spec: EquipmentSpecDto | null;
};

export type MeasurementItemSnapshotDto = {
  stackPollutantId: number;
  pollutantId: number;
  nameKr: string;
  nameEn: string;
  field: MeasurementField;
  method: MeasurementMethod;
  phase: PollutantPhase;
  equipment: string;
  testMethod: string;
  cycle: MeasurementCycle;
  allowance: number | null;
};

// ─────────────────────────────────────────────────────────────
// 측정 시트(MeasurementSheet) — GET 응답에 포함 / PUT 요청 바디
// 계산결과 키(pa/xw/o2CorrectionFactor)는 소문자, 측정점 물리량(Ts/Pv/Ps/Vs/Vm/Vlc/kFactor/Cp)은 대문자.
// ─────────────────────────────────────────────────────────────

export type MeasurementSheetDto = {
  category: MeasurementCategory;
  weather: WeatherDataDto;
  moisture: MoistureDataDto;
  exhaustGas: ExhaustGasDataDto;
  measurementPoints: MeasurementPointDto[];
  samples: SampleDto[];
  particleSample: ParticleSampleDto;
  // 시트레벨 계산결과
  avgTg: number | null;
  avgPv: number | null;
  avgPs: number | null;
  avgTm: number | null;
  quantity: number | null;
};

export type PressureDto = {
  pressure: number | null;          // 대기압(hPa) 입력값
  unit: string;
};

export type WeatherDataDto = {
  pressure: PressureDto;
  weatherCondition: WeatherCondition | null;
  temperature: number | null;
  humidity: number | null;
  windDirection: WindDirection | null;
  windSpeed: number | null;
  pa: number | null;                // 계산결과 (mmHg) — 소문자 키
};

export type BeforeAfterDto = { before: number | null; after: number | null };
export type InOutDto = { in: number | null; out: number | null };

export type MoistureDataDto = {
  weight: BeforeAfterDto;
  gasMeterTemperature: InOutDto;
  dryGasVolume: BeforeAfterDto;
  suctionVelocity: number | null;
  gasMeterGaugePressure: number | null;
  xw: number | null;                // 계산결과 (%) — 소문자 키
};

export type ExhaustGasDataDto = {
  o2Concentration: number[];
  co2Concentration: number[];
  coConcentration: number[];
  noxConcentration: number[];
  soxConcentration: number[];
  gasAnalyzerStartTime: string | null;  // "HH:mm:ss"
  thcAnalyzerStartTime: string | null;
  gasDensity: number | null;            // 계산결과
  o2CorrectionFactor: number | null;    // 계산결과 (산소보정계수)
};

export type EquipmentTemperatureDto = { inTm: number | null; outTm: number | null; avgTm: number | null };
export type EquipmentVolumeDto = { beforeVm: number | null; afterVm: number | null };

export type MeasurementPointDto = {
  Ts: number | null;                // 배출가스온도
  Pv: number | null;                // 동압
  Ps: number | null;                // 정압
  equipmentTemperature: EquipmentTemperatureDto;
  equipmentVolume: EquipmentVolumeDto;
  samplingTime: number | null;
  vacuumGaugePressure: number | null;
  finalImpingerTemperature: number | null;
  // 계산·보존 영역
  Vs: number | null;
  gasDensity: number | null;
  Vm: number | null;
  Vlc: number | null;
  kFactor: number | null;
  orificeDp: number | null;
  isokineticRatio: number | null;
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

export type ParticleSampleDto = {
  Cp: number | null;                // 피토관계수 (계산결과)
  nozzleSize: number | null;
  Vm: number | null;
  samplingTime: number | null;
  measureStartTime: string | null;  // "HH:mm:ss"
  measureEndTime: string | null;
  kFactor: number | null;
  orificeDp: number | null;
  isokineticRatio: number | null;
  samplingStartTime: string | null;
  samplingEndTime: string | null;
  thimbleFilter: string;
  bgThimbleFilter: string;
};

// 저장 요청 — PUT /schedules/{id}/sheets
export type SaveSheetsRequest = {
  sheets: MeasurementSheetDto[];
};
