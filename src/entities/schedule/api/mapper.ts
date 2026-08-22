import type {
  CreateScheduleRequest, ScheduleResponse, SaveSheetsRequest,
  ChangeScheduleEquipmentsRequest, ChangeClientSnapshotRequest, ChangeStackSnapshotRequestBody,
  ChangeScheduleItemsRequest, UpdateScheduleItemRequest, UpdateBasicInfoRequest, UpdateScheduleRequest,
  PreviousSheetResponse,
  PreviousSheetCandidateResponse,
  AnalysisRecordResponse, CreateAnalysisRecordRequest, UpdateAnalysisRecordRequest,
} from "./dto";
import type {
  ScheduleCreate, ScheduleDetail, SheetSave, SheetRef,
  ScheduleEquipmentsUpdate, ClientSnapshotUpdate, StackSnapshotUpdate, BasicInfoUpdate, ScheduleMetaUpdate,
  ScheduleItemsUpdate, ScheduleItemUpdate, PreviousSheet, PreviousSheetCandidate,
  AnalysisRecord, AnalysisRecordCreate, AnalysisRecordUpdate,
} from "../model/types";

// Domain(number) → DTO(number): 재변환 없이 passthrough.
export const toRegisterRequest = (vo: ScheduleCreate): CreateScheduleRequest => ({
  stackId: vo.stackId,
  teamId: vo.teamId,
  measurementField: vo.measurementField,
  sampledAt: vo.sampledAt,
  schedulePurpose: vo.schedulePurpose,
  referenceNumber: vo.referenceNumber,
  pollutantIds: vo.pollutantIds,
});

// 응답 DTO → 도메인 상세. 숫자는 이미 number, 키를 그대로 유지하므로 구조 변환 없이 채택한다.
export const toScheduleDetail = (dto: ScheduleResponse): ScheduleDetail => dto;

// 도메인 시트 입력 → 저장 요청 DTO: 재변환 없이 passthrough.
// 삭제 목록을 함께 실어야 서버가 "요청에서 빠진 시트"를 보관본 유지로 처리할 수 있다.
export const toSaveSheetsRequest = (sheets: SheetSave[], deletedSheets: SheetRef[]): SaveSheetsRequest =>
  ({ sheets, deletedSheets });

// 응답 DTO → 도메인: 키를 그대로 유지하므로 구조 변환이 없다.
// null(불러올 기록 없음)은 오류가 아니라 정상 결과이므로 그대로 통과시킨다.
export const toPreviousSheet = (dto: PreviousSheetResponse | null): PreviousSheet | null => dto;

export const toPreviousSheetCandidates = (
  dtos: PreviousSheetCandidateResponse[],
): PreviousSheetCandidate[] => dtos;

// 장비 식별자는 서버 계약이 String이므로 숫자로 변환하지 않는다.
export const toChangeEquipmentsRequest = (
  vo: ScheduleEquipmentsUpdate,
): ChangeScheduleEquipmentsRequest => ({
  particleSamplerId: vo.particleSamplerId,
  gasSamplerId: vo.gasSamplerId,
  pitotTubeId: vo.pitotTubeId,
  nozzleId: vo.nozzleId,
});

// 날짜·시각은 전 레이어 string이므로 재변환 없이 passthrough.
export const toUpdateBasicInfoRequest = (vo: BasicInfoUpdate): UpdateBasicInfoRequest => ({
  facilityManager: vo.facilityManager,
  samplingWitness: vo.samplingWitness,
  analyst: vo.analyst,
  technicalManager: vo.technicalManager,
  receivedAt: vo.receivedAt,
  analyzedAt: vo.analyzedAt,
  issuedAt: vo.issuedAt,
  samplingStartedAt: vo.samplingStartedAt,
  samplingEndedAt: vo.samplingEndedAt,
  mentorName: vo.mentorName,
  menteeName: vo.menteeName,
});

// 날짜·문자열뿐이라 재변환 없이 passthrough.
// measurementField 는 이 경로를 쓰는 화면이 다루지 않으므로 null(기존 값 유지)로 둔다.
export const toUpdateScheduleRequest = (vo: ScheduleMetaUpdate): UpdateScheduleRequest => ({
  measurementField: null,
  sampledAt: vo.sampledAt,
  schedulePurpose: vo.schedulePurpose,
  referenceNumber: vo.referenceNumber,
  tenant: vo.tenant,
});

// Domain(number) → DTO(number): 재변환 없이 passthrough.
// facilities/preventions는 보내지 않아야 서버가 기존 목록을 유지한다.
const toChangeStackBody = (vo: StackSnapshotUpdate): ChangeStackSnapshotRequestBody => ({
  field: vo.field,
  name: vo.name,
  semsNumber: vo.semsNumber,
  grade: vo.grade,
  mainProduct: vo.mainProduct,
  standardOxygen: vo.standardOxygen,
  height: vo.height,
  horizontalLength: vo.horizontalLength,
  verticalLength: vo.verticalLength,
  shape: vo.shape,
  orientation: vo.orientation,
});

// 미전달 = 기존 값 유지이므로, VO에 없는 키는 요청 바디에도 넣지 않는다(undefined는 JSON에서 생략됨).
export const toChangeClientRequest = (vo: ClientSnapshotUpdate): ChangeClientSnapshotRequest => ({
  name: vo.name,
  bizNumber: vo.bizNumber,
  representative: vo.representative,
  roadAddress: vo.roadAddress,
  detailAddress: vo.detailAddress,
  zipcode: vo.zipcode,
  email: vo.email,
  tel: vo.tel,
  workplace: vo.workplace && {
    name: vo.workplace.name,
    bizNumber: vo.workplace.bizNumber,
    businessCategory: vo.workplace.businessCategory,
    roadAddress: vo.workplace.roadAddress,
    detailAddress: vo.workplace.detailAddress,
    zipcode: vo.workplace.zipcode,
    grade: vo.workplace.grade,
    stack: vo.workplace.stack && toChangeStackBody(vo.workplace.stack),
  },
});

// 측정항목은 전체 교체이므로 부분 병합이 없다 — id 목록을 그대로 싣는다.
export const toChangeItemsRequest = (vo: ScheduleItemsUpdate): ChangeScheduleItemsRequest => ({
  pollutantIds: vo.pollutantIds,
});

// 측정항목 정정은 그 항목의 측정 조건을 확정해 보내므로 부분 병합이 없다 — 숫자 재변환 없이 passthrough.
export const toUpdateItemRequest = (vo: ScheduleItemUpdate): UpdateScheduleItemRequest => ({
  cycle: vo.cycle,
  allowance: vo.allowance,
  oxygenApplicable: vo.oxygenApplicable,
});

// ─────────────────────────────────────────────────────────────
// 실험분석정보 — 응답은 키 구조가 같아 그대로 채택하고, 요청은 숫자 재변환 없이 passthrough.
// ─────────────────────────────────────────────────────────────

export const toAnalysisRecord = (dto: AnalysisRecordResponse): AnalysisRecord => dto;

export const toAnalysisRecords = (dtos: AnalysisRecordResponse[]): AnalysisRecord[] => dtos;

export const toCreateAnalysisRequest = (vo: AnalysisRecordCreate): CreateAnalysisRecordRequest => ({
  pollutantId: vo.pollutantId,
  analysisValue: vo.analysisValue,
  unit: vo.unit,
  analysisMethod: vo.analysisMethod,
  analysisEquipment: vo.analysisEquipment,
});

export const toUpdateAnalysisRequest = (vo: AnalysisRecordUpdate): UpdateAnalysisRecordRequest => ({
  analysisValue: vo.analysisValue,
  unit: vo.unit,
  analysisMethod: vo.analysisMethod,
  analysisEquipment: vo.analysisEquipment,
});
