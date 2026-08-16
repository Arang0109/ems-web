import type {
  CreateScheduleRequest, ScheduleResponse, SaveSheetsRequest,
  ChangeScheduleEquipmentsRequest, ChangeClientSnapshotRequest, ChangeStackSnapshotRequestBody,
  UpdateBasicInfoRequest,
} from "./dto";
import type {
  ScheduleCreate, ScheduleDetail, SheetSave,
  ScheduleEquipmentsUpdate, ClientSnapshotUpdate, StackSnapshotUpdate, BasicInfoUpdate,
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
export const toSaveSheetsRequest = (sheets: SheetSave[]): SaveSheetsRequest => ({ sheets });

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
