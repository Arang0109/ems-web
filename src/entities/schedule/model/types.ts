import type { MeasurementField } from "@shared/model";
import type {
  ScheduleListResponse, ScheduleResponse, ScheduleSnapshotDto,
  BasicInfoDto, TeamSnapshotDto, ClientSnapshotDto, WorkplaceSnapshotDto,
  StackSnapshotDto, FacilitySnapshotDto, PreventionSnapshotDto, TargetSubstanceSnapshotDto,
  EquipmentSnapshotDto, EquipmentSpecDto, MeasurementItemSnapshotDto,
  MeasurementSheetDto, WeatherDataDto, MoistureDataDto, ExhaustGasDataDto,
  MeasurementPointDto, SampleDto, ParticleSampleDto,
} from "../api/dto";

export type ScheduleListItem = ScheduleListResponse;

// 도메인 입력 모델 — 숫자는 number, ID는 number. 자릿수/코드 문자열은 string.
export type ScheduleCreate = {
  stackId: number;
  teamId: number;
  measurementField: MeasurementField;
  measureDate: string;              // 서버 LocalDateTime (ISO 문자열)
  measurementType: string | null;
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
export type TargetSubstanceSnapshot = TargetSubstanceSnapshotDto;
export type EquipmentSnapshot = EquipmentSnapshotDto;
export type EquipmentSpec = EquipmentSpecDto;
export type MeasurementItemSnapshot = MeasurementItemSnapshotDto;

export type MeasurementSheet = MeasurementSheetDto;
export type WeatherData = WeatherDataDto;
export type MoistureData = MoistureDataDto;
export type ExhaustGasData = ExhaustGasDataDto;
export type MeasurementPoint = MeasurementPointDto;
export type Sample = SampleDto;
export type ParticleSample = ParticleSampleDto;

// 시트 저장 입력 도메인 모델 (Form → Domain 변환 결과)
export type SheetSave = MeasurementSheetDto;
