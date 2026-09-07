import type { MeasurementField, MeasurementType } from "@shared/model";

export type ScheduleRegisterForm = {
  clientId: string;         // UI 연쇄 선택용 (서버 전송 대상 아님)
  workplaceId: string;      // UI 연쇄 선택용 (서버 전송 대상 아님)
  stackId: string;          // 측정시설
  teamId: string;           // 측정 팀
  // null 이면 선택한 팀의 기본값(사수·부사수)을 따른다. 사용자가 직접 고치면 문자열이 된다.
  mentorName: string | null;  // 측정 담당자
  menteeName: string | null;  // 측정 보조자
  measurementField: MeasurementField;  // 기본값이 있어 미선택 상태가 없다
  measureDate: string;      // 측정 일자 (yyyy-MM-dd)
  measurementType: MeasurementType;
  referenceNumber: string;  // 관리번호
  pollutantIds: string[];   // 선택된 측정항목의 pollutantId 목록 (Select 값과 동일하게 string)
};

export const getDefaultScheduleRegisterForm = (): ScheduleRegisterForm => ({
  clientId: "",
  workplaceId: "",
  stackId: "",
  teamId: "",
  mentorName: null,
  menteeName: null,
  measurementField: "AIR",
  measureDate: "",
  measurementType: "SELF",
  referenceNumber: "",
  pollutantIds: [],
});
