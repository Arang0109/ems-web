import { measurementUnitText } from "@shared/model";

import type {
  CreateScheduleRequest, ScheduleResponse, SaveSheetsRequest,
  ChangeScheduleEquipmentsRequest, ChangeClientSnapshotRequest, ChangeStackSnapshotRequestBody,
  ChangeScheduleItemsRequest, UpdateScheduleItemRequest, UpdateBasicInfoRequest, UpdateScheduleRequest,
  PreviousSheetResponse,
  PreviousSheetCandidateResponse,
  AnalysisResultResponse, SaveSamplingTimesRequest, SaveAnalysisResultsRequest,
} from "./dto";
import type {
  ScheduleCreate, ScheduleDetail, SheetSave, SheetRef,
  ScheduleEquipmentsUpdate, ClientSnapshotUpdate, StackSnapshotUpdate, BasicInfoUpdate, ScheduleMetaUpdate,
  ScheduleItemsUpdate, ScheduleItemUpdate, PreviousSheet, PreviousSheetCandidate,
  AnalysisResult, SamplingTimesSave, AnalysisResultsSave,
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
// 전체 교체이므로 화면에 있는 장비 전부를 그대로 싣는다.
export const toChangeEquipmentsRequest = (
  vo: ScheduleEquipmentsUpdate,
): ChangeScheduleEquipmentsRequest => ({
  equipmentIds: vo.equipmentIds,
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
// 측정분야는 생성 시점에만 정하므로 이 요청에 담기지 않는다.
export const toUpdateScheduleRequest = (vo: ScheduleMetaUpdate): UpdateScheduleRequest => ({
  sampledAt: vo.sampledAt,
  schedulePurpose: vo.schedulePurpose,
  referenceNumber: vo.referenceNumber,
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

/**
 * 측정단위를 서버에 보낼 표기로 맞춘다 — `MG_PER_SM3` 가 아니라 `mg/Sm³`, `PPM` 이 아니라 `ppm`.
 *
 * 단위 enum 은 Select 입력을 위한 화면 쪽 사정이고, 서버 계약의 `unit` 은 성적서에 그대로 찍히는
 * 자유 문자열이다. 이미 표기로 들어온 값은 그대로 통과하며(멱등), enum 이 아닌 값은 손대지 않는다.
 */
const toUnitNotation = (unit: string | null): string | null => measurementUnitText(unit) || null;

export const toAnalysisResult = (dto: AnalysisResultResponse): AnalysisResult => dto;

export const toAnalysisResults = (dtos: AnalysisResultResponse[]): AnalysisResult[] => dtos;

export const toSaveAnalysisResultsRequest = (vo: AnalysisResultsSave): SaveAnalysisResultsRequest => ({
  items: vo.items.map((item) => ({
    pollutantId: item.pollutantId,
    analysisValue: item.analysisValue,
    unit: toUnitNotation(item.unit),
    analysisMethod: item.analysisMethod,
    analysisEquipment: item.analysisEquipment,
  })),
});

export const toSaveSamplingTimesRequest = (vo: SamplingTimesSave): SaveSamplingTimesRequest => ({
  items: vo.items.map((item) => ({
    pollutantId: item.pollutantId,
    samplingStartedAt: item.samplingStartedAt,
    samplingEndedAt: item.samplingEndedAt,
  })),
});
