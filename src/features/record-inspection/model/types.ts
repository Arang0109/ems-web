import type { InspectionType, InspectionResult } from "@shared/model";

// 검사 실시 기록 폼 — 이력은 한 번 남기면 수정되지 않으므로 등록 폼만 존재한다.
export type InspectionRecordForm = {
  type: InspectionType;
  inspectedAt: string;        // yyyy-MM-dd
  validUntil: string;         // 성적서에 명시된 유효기간 만료일
  agency: string;
  certificateNumber: string;
  result: InspectionResult | '';   // 미선택은 ''
  remark: string;
};

export const getDefaultInspectionRecordForm = (type: InspectionType): InspectionRecordForm => ({
  type,
  inspectedAt: '',
  validUntil: '',
  agency: '',
  certificateNumber: '',
  result: '',
  remark: '',
});
