import type { StackRegisterForm } from "./types";
import type { StackCreate } from "@entities/stack";

import { toNumberOrNull, trimValue } from "@shared/lib";

export const toStackCreate = (
  form: StackRegisterForm
): StackCreate => ({
  workplaceId: form.workplaceId,
  field: form.field,
  name: trimValue(form.stackName),
  semsNumber: trimValue(form.semsNumber),
  grade: form.grade,
  mainProduct: trimValue(form.mainProduct),
  // 서버가 nullable(Integer)이라 빈 입력은 0이 아니라 null로 보낸다.
  // 0으로 보내면 "미지정"이 실제 0%로 저장돼 산소보정계수 계산이 어긋난다.
  standardOxygen: toNumberOrNull(form.standardOxygen),
});