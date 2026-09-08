import type { MeasurementField, MeasurementType, Grade, Shape, Orientation, MeasurementCycle } from "@shared/model";
import type {
  ScheduleListResponse, ScheduleResponse, ScheduleSnapshotDto, SamplingSnapshotDto,
  TeamSnapshotDto, TenantSnapshotDto, ClientSnapshotDto, WorkplaceSnapshotDto,
  StackSnapshotDto, FacilitySnapshotDto, PreventionSnapshotDto,
  EquipmentSnapshotDto, EquipmentSpecDto, ParticleSamplerSpecDto,
  MeasurementItemSnapshotDto, AnalysisResultDto,
  SamplingSheetDto, SamplingSheetResponse, WeatherDataDto, MoistureDataDto, ExhaustGasDataDto,
  FlowRateDataDto, ParticulateSamplingDto, SamplingPointDto, IsokineticSamplingDto,
  GaseousSamplingDto, SheetRefDto,
  PreviousSheetResponse, PreviousSheetCandidateResponse,
  AnalysisResultResponse,
} from "../api/dto";

export type ScheduleListItem = ScheduleListResponse;

// 도메인 입력 모델 — 숫자는 number, ID는 number. 자릿수/코드 문자열은 string.
export type ScheduleCreate = {
  stackId: number;
  teamId: number;
  mentorId: number | null;
  menteeId: number | null;
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
// 그 회차의 현장 채취 사실 — 채취 시각·현장 담당자·채취 기록지를 함께 담는다.
export type SamplingSnapshot = SamplingSnapshotDto;
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
// 측정항목 안에 놓인 실험실 분석 결과. null 이면 아직 분석 전이다.
export type ItemAnalysisResult = AnalysisResultDto;

// 조회된 기록지(읽기 모델). 블록(weather·moisture·exhaustGas·측정점·가스상 채취)이 null 로 올 수 있다 —
// 이전 회차 불러오기가 대기압조차 없는 회차의 기상 블록을 비워서 주기 때문이며,
// 읽는 쪽이 방어해야 한다.
export type SamplingSheet = SamplingSheetResponse;
export type WeatherData = WeatherDataDto;
export type MoistureData = MoistureDataDto;
export type ExhaustGasData = ExhaustGasDataDto;
export type FlowRateData = FlowRateDataDto;
export type ParticulateSampling = ParticulateSamplingDto;
export type SamplingPoint = SamplingPointDto;
export type IsokineticSampling = IsokineticSamplingDto;
export type GaseousSampling = GaseousSamplingDto;

// 시트 저장 입력 도메인 모델 (Form → Domain 변환 결과).
// 폼이 전 블록을 채워 만들므로 SamplingSheet 와 달리 블록이 non-null 이다.
export type SheetSave = SamplingSheetDto;

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

// 배정 장비 교체. 이 회차에 들고 갈 장비를 전달 목록으로 전체 교체한다 —
// 유형(입자 샘플러·가스 샘플러·피토관·노즐)은 서버가 장비 원장에서 판별하므로 담지 않는다.
// 장비 식별자는 서버 계약이 String(UUID)이므로 "ID는 number" 규칙의 예외다.
// 전 레이어 string으로 두고 Number() 변환을 하지 않는다.
export type ScheduleEquipmentsUpdate = {
  equipmentIds: string[];
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

// 측정계획 정의 수정. 채취일자·측정용도·관리번호가 여기 속한다(BasicInfoUpdate 계약 밖이다).
// 전달한 값을 그대로 채택하므로 빈 값은 기존 값을 지운다 — 단 채취일자는 측정 건수 집계의
// 기준일이라 서버가 비우지 못하게 막는다.
export type ScheduleMetaUpdate = {
  sampledAt: string;                      // "yyyy-MM-dd"
  schedulePurpose: MeasurementType | null;
  referenceNumber: string | null;
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

// 성적서 내려받기 결과 — 서버가 채운 xlsx 한 개와 Content-Disposition에서 얻은 파일명.
export type ReportExport = {
  blob: Blob;
  filename: string;
};

// ─────────────────────────────────────────────────────────────
// 실험분석정보 (측정계획 문서의 측정항목에 딸린 값)
// 응답은 숫자가 이미 number이고 키 구조가 화면과 같아 DTO를 도메인으로 채택한다.
// 등록·삭제 입력이 없는 것은 서버에 그 경로가 없기 때문이다 — 항목이 곧 행이므로
// 행을 더하고 빼는 일은 계획의 측정항목 교체(ScheduleItemsUpdate)가 맡는다.
// ─────────────────────────────────────────────────────────────

export type AnalysisResult = AnalysisResultResponse;

/**
 * 항목별 실험분석 결과 일괄 저장 입력.
 *
 * 측정물질을 키로 upsert 하므로 호출자가 신규·기존을 가릴 필요가 없다 — 성적서 탭이 채취시간을
 * 먼저 채워 둔 항목에도 그대로 저장된다. null 은 "지움"이며 채취시간은 바뀌지 않는다.
 */
export type AnalysisResultsSave = {
  items: AnalysisResultEntry[];
};

export type AnalysisResultEntry = {
  pollutantId: number;
  analysisValue: number | null;
  unit: string | null;
  analysisMethod: string | null;
  analysisEquipment: string | null;
};

/**
 * 성적서 항목별 채취시간 일괄 저장 입력.
 *
 * 수정(PUT)과 달리 **null 은 "기존 값 유지"가 아니라 "지움"**이다 — 성적서 탭이 항목 표 전체를
 * 보내므로 빈 칸을 미전달로 읽으면 한번 채운 시각을 다시 비울 방법이 없어진다.
 * 실험실 입력값은 이 경로로 바뀌지 않는다(실험·분석 탭이 소유).
 */
export type SamplingTimesSave = {
  items: SamplingTimeEntry[];
};

export type SamplingTimeEntry = {
  pollutantId: number;
  samplingStartedAt: string | null;   // 서버 LocalTime ("HH:mm:ss")
  samplingEndedAt: string | null;
};
