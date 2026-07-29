import type { MeasurementField, Grade, Shape, Orientation } from "@shared/model";
import type {
  ScheduleListResponse, ScheduleResponse, ScheduleSnapshotDto,
  BasicInfoDto, TeamSnapshotDto, ClientSnapshotDto, WorkplaceSnapshotDto,
  StackSnapshotDto, FacilitySnapshotDto, PreventionSnapshotDto,
  EquipmentSnapshotDto, EquipmentSpecDto, ParticleSamplerSpecDto, MeasurementItemSnapshotDto,
  MeasurementSheetDto, WeatherDataDto, MoistureDataDto, ExhaustGasDataDto,
  QuantityDataDto, ParticleDataDto, SamplingPointDto, ParticleSamplingDto, SampleDto,
} from "../api/dto";

export type ScheduleListItem = ScheduleListResponse;

// 도메인 입력 모델 — 숫자는 number, ID는 number. 자릿수/코드 문자열은 string.
export type ScheduleCreate = {
  stackId: number;
  teamId: number;
  measurementField: MeasurementField;
  sampledAt: string;              // 서버 LocalDate ("yyyy-MM-dd")
  schedulePurpose: string | null;
  referenceNumber: string | null;
  pollutantIds: number[];           // 선택된 측정항목의 pollutantId 목록
};

// ─────────────────────────────────────────────────────────────
// 상세 조회 도메인 모델
// 서버 스냅샷/시트는 숫자가 이미 number이고 키를 그대로 유지하는 편이
// 계산결과 표시(pa/xw/o2CorrectionFactor 등)에 유리하므로 DTO 구조를 도메인으로 채택한다.
// ─────────────────────────────────────────────────────────────

export type ScheduleDetail = ScheduleResponse;
export type ScheduleSnapshot = ScheduleSnapshotDto;
export type BasicInfo = BasicInfoDto;
export type TeamSnapshot = TeamSnapshotDto;
export type ClientSnapshot = ClientSnapshotDto;
export type WorkplaceSnapshot = WorkplaceSnapshotDto;
export type StackSnapshot = StackSnapshotDto;
export type FacilitySnapshot = FacilitySnapshotDto;
export type PreventionSnapshot = PreventionSnapshotDto;
export type EquipmentSnapshot = EquipmentSnapshotDto;
export type EquipmentSpec = EquipmentSpecDto;
export type ParticleSamplerSpec = ParticleSamplerSpecDto;
export type MeasurementItemSnapshot = MeasurementItemSnapshotDto;

export type MeasurementSheet = MeasurementSheetDto;
export type WeatherData = WeatherDataDto;
export type MoistureData = MoistureDataDto;
export type ExhaustGasData = ExhaustGasDataDto;
export type QuantityData = QuantityDataDto;
export type ParticleData = ParticleDataDto;
export type SamplingPoint = SamplingPointDto;
export type ParticleSampling = ParticleSamplingDto;
export type Sample = SampleDto;

// 시트 저장 입력 도메인 모델 (Form → Domain 변환 결과)
export type SheetSave = MeasurementSheetDto;

// ─────────────────────────────────────────────────────────────
// 스냅샷 수정 입력 도메인 모델 (Form → Domain 변환 결과)
// 서버는 null을 "기존 값 유지"로 해석한다. 값을 비우는 방법은 없다.
// ─────────────────────────────────────────────────────────────

// 배정 장비 교체.
// 장비 식별자는 서버 계약이 String(UUID)이므로 "ID는 number" 규칙의 예외다.
// 전 레이어 string으로 두고 Number() 변환을 하지 않는다.
export type ScheduleEquipmentsUpdate = {
  particleSamplerId: string | null;
  gasSamplerId: string | null;
  pitotTubeId: string | null;
  nozzleId: string | null;
};

// 기본정보 수정. 담당자·접수/분석/발행일자·채취 시각·측정자 표기명을 다룬다.
// 시간·날짜는 문자열이므로 숫자 타입 규칙의 대상이 아니다.
export type BasicInfoUpdate = {
  facilityManager: string | null;
  samplingWitness: string | null;
  analyst: string | null;
  technicalManager: string | null;
  receivedAt: string | null;        // "yyyy-MM-dd"
  analyzedAt: string | null;
  issuedAt: string | null;
  samplingStartedAt: string | null; // "HH:mm:ss" — 측정계획 단위 공통 채취 시각
  samplingEndedAt: string | null;
  mentorName: string | null;
  menteeName: string | null;
};

// 의뢰기관 스냅샷 수정. 트리 어느 깊이든 전달한 필드만 수정되고 나머지는 서버가 기존 값을 유지한다.
// 원장 연결키(clientId/workplaceId/stackId)는 수정 대상이 아니라 키 자체를 두지 않는다.
// 담당자(배출시설관리자·시료채취입회자)는 BasicInfoUpdate 소관이다.
export type ClientSnapshotUpdate = {
  name?: string;
  bizNumber?: string;
  representative?: string;
  roadAddress?: string;
  detailAddress?: string;
  zipcode?: string;
  email?: string;
  tel?: string;
  workplace?: WorkplaceSnapshotUpdate;
};

export type WorkplaceSnapshotUpdate = {
  name?: string;
  bizNumber?: string;
  roadAddress?: string;
  detailAddress?: string;
  zipcode?: string;
  grade?: Grade;
  stack?: StackSnapshotUpdate;
};

// 측정시설(굴뚝) 제원 수정. facilities/preventions는 전송 대상이 아니다.
export type StackSnapshotUpdate = {
  field: MeasurementField;          // Select 값이라 항상 존재
  name: string;
  semsNumber: string;
  grade: Grade;
  businessCategory: string;
  mainProduct: string;
  standardOxygen: number | null;    // 서버가 nullable — 미지정과 0을 구분한다
  height: number | null;
  horizontalLength: number | null;
  verticalLength: number | null;
  shape: Shape;
  orientation: Orientation;
};

// 채취기록지 내려받기 결과 — 서버가 만든 ZIP과 Content-Disposition에서 얻은 파일명.
export type SamplingRecordsExport = {
  blob: Blob;
  filename: string;
};
