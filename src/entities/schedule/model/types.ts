import type { MeasurementField, MeasurementType, Grade, Shape, Orientation, MeasurementCycle } from "@shared/model";
import type {
  ScheduleListResponse, ScheduleResponse, ScheduleSnapshotDto,
  BasicInfoDto, TeamSnapshotDto, TenantSnapshotDto, ClientSnapshotDto, WorkplaceSnapshotDto,
  StackSnapshotDto, FacilitySnapshotDto, PreventionSnapshotDto,
  EquipmentSnapshotDto, EquipmentSpecDto, ParticleSamplerSpecDto, MeasurementItemSnapshotDto,
  MeasurementSheetDto, MeasurementSheetResponse, WeatherDataDto, MoistureDataDto, ExhaustGasDataDto,
  QuantityDataDto, ParticleDataDto, SamplingPointDto, ParticleSamplingDto, SampleDto, SheetRefDto,
  PreviousSheetResponse, PreviousSheetCandidateResponse,
  AnalysisRecordResponse,
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
// 측정 시점 고객사(대행업체) 스냅샷 — 성적서 발행이 읽는 값이다.
export type TenantSnapshot = TenantSnapshotDto;
export type ClientSnapshot = ClientSnapshotDto;
export type WorkplaceSnapshot = WorkplaceSnapshotDto;
export type StackSnapshot = StackSnapshotDto;
export type FacilitySnapshot = FacilitySnapshotDto;
export type PreventionSnapshot = PreventionSnapshotDto;
export type EquipmentSnapshot = EquipmentSnapshotDto;
export type EquipmentSpec = EquipmentSpecDto;
export type ParticleSamplerSpec = ParticleSamplerSpecDto;
export type MeasurementItemSnapshot = MeasurementItemSnapshotDto;

// 조회된 시트(읽기 모델). 블록(weather·moisture·exhaustGas·측정점·시료)이 null 로 올 수 있다 —
// 이전 회차 불러오기가 기상 블록을 비워서 주기 때문이며, 읽는 쪽이 방어해야 한다.
export type MeasurementSheet = MeasurementSheetResponse;
export type WeatherData = WeatherDataDto;
export type MoistureData = MoistureDataDto;
export type ExhaustGasData = ExhaustGasDataDto;
export type QuantityData = QuantityDataDto;
export type ParticleData = ParticleDataDto;
export type SamplingPoint = SamplingPointDto;
export type ParticleSampling = ParticleSamplingDto;
export type Sample = SampleDto;

// 시트 저장 입력 도메인 모델 (Form → Domain 변환 결과).
// 폼이 전 블록을 채워 만들므로 MeasurementSheet 와 달리 블록이 non-null 이다.
export type SheetSave = MeasurementSheetDto;

// 삭제할 시트 참조 (Form → Domain 변환 결과)
export type SheetRef = SheetRefDto;

// 새 기록지를 채울 이전 회차 기록. 출처를 함께 들고 있어야 화면이
// "언제 측정한 값을 가져왔는지" 밝힐 수 있다 — 출처를 모르면 그 값을 믿을지 판단할 수 없다.
export type PreviousSheet = PreviousSheetResponse;

// 불러오기 출처로 고를 수 있는 이전 회차. 시트 본문은 없고 "어느 회차인가"만 담는다 —
// 목록에서는 회차를 고르기만 하고, 값은 고른 뒤 한 건만 받아 온다.
export type PreviousSheetCandidate = PreviousSheetCandidateResponse;

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

// 측정계획 메타 수정. 관리번호·채취일자·측정용도가 여기 속하며,
// 서버가 문서 스냅샷의 basicInfo 까지 같은 값으로 동기화한다(BasicInfoUpdate 계약 밖이다).
// tenant 는 값을 바꾸려는 자리가 아니다 — 서버가 이 필드만 "null = 덮어쓰기" 로 처리하므로
// 조회한 스냅샷의 tenant 를 그대로 되돌려 실어 유실을 막는다.
export type ScheduleMetaUpdate = {
  sampledAt: string | null;               // "yyyy-MM-dd"
  schedulePurpose: MeasurementType | null;
  referenceNumber: string | null;
  tenant: TenantSnapshot | null;
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
  businessCategory?: string;
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
  mainProduct: string;
  standardOxygen: number | null;    // 서버가 nullable — 미지정과 0을 구분한다
  height: number | null;
  horizontalLength: number | null;
  verticalLength: number | null;
  shape: Shape;
  orientation: Orientation;
};

// 측정항목 교체 입력 — 이번 계획에서 측정할 측정물질 id 목록(전체 교체).
export type ScheduleItemsUpdate = {
  pollutantIds: number[];
};

// 측정항목 정정 입력 — 이 회차 문서에 담긴 항목 하나의 측정 조건.
// 어느 물질인지는 경로(pollutantId)가 정하므로 담지 않는다.
export type ScheduleItemUpdate = {
  cycle: MeasurementCycle;
  allowance: number | null;
  oxygenApplicable: boolean;
};

// 채취기록지 내려받기 결과 — 서버가 만든 ZIP과 Content-Disposition에서 얻은 파일명.
export type SamplingRecordsExport = {
  blob: Blob;
  filename: string;
};

// ─────────────────────────────────────────────────────────────
// 실험분석정보 (schedule 하위 리소스)
// 응답은 숫자가 이미 number이고 키 구조가 화면과 같아 DTO를 도메인으로 채택한다.
// ─────────────────────────────────────────────────────────────

export type AnalysisRecord = AnalysisRecordResponse;

/** 등록 입력. 허용기준치·산소보정 적용 여부는 서버가 측정 시점 스냅샷에서 복사한다. */
export type AnalysisRecordCreate = {
  pollutantId: number;
  analysisValue: number;            // 측정분석값 (필수)
  unit: string | null;              // 측정단위
  analysisMethod: string | null;    // 측정분석방법
  analysisEquipment: string | null; // 분석장비
};

/** 수정 입력. null은 "기존 값 유지"이며 측정항목은 바꿀 수 없다. */
export type AnalysisRecordUpdate = {
  analysisValue: number | null;
  unit: string | null;
  analysisMethod: string | null;
  analysisEquipment: string | null;
};
