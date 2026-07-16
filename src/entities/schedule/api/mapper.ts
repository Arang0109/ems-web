import type { CreateScheduleRequest, ScheduleResponse, SaveSheetsRequest } from "./dto";
import type { ScheduleCreate, ScheduleDetail, SheetSave } from "../model/types";

// Domain(number) → DTO(number): 재변환 없이 passthrough.
export const toRegisterRequest = (vo: ScheduleCreate): CreateScheduleRequest => ({
  stackId: vo.stackId,
  teamId: vo.teamId,
  measurementField: vo.measurementField,
  measureDate: vo.measureDate,
  measurementType: vo.measurementType,
  referenceNumber: vo.referenceNumber,
  pollutantIds: vo.pollutantIds,
});

// 응답 DTO → 도메인 상세. 숫자는 이미 number, 키를 그대로 유지하므로 구조 변환 없이 채택한다.
export const toScheduleDetail = (dto: ScheduleResponse): ScheduleDetail => dto;

// 도메인 시트 입력 → 저장 요청 DTO: 재변환 없이 passthrough.
export const toSaveSheetsRequest = (sheets: SheetSave[]): SaveSheetsRequest => ({ sheets });
