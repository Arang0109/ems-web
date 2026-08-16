import type { InspectionRecordForm } from "./types";
import type { InspectionRecordCreate } from "@entities/equipment";
import { trimValue } from "@shared/lib";

export const toInspectionRecordCreate = (form: InspectionRecordForm): InspectionRecordCreate => ({
  type: form.type,
  inspectedAt: form.inspectedAt,
  // 유효기간을 전달하면 서버가 다음 예정일을 이 날짜로 지정한다. 미입력은 주기 계산으로 돌아간다.
  validUntil: form.validUntil || null,
  agency: trimValue(form.agency),
  certificateNumber: trimValue(form.certificateNumber),
  result: form.result || null,
  remark: trimValue(form.remark),
});
