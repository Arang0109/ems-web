import type { ClientSnapshotUpdate } from "@entities/schedule";
import { trimValue, unformatNumber, toNumberOrNull } from "@shared/lib";

import type { ScheduleClientUpdateForm } from "./types";

// Form(string) → Domain. 사업자번호·전화번호는 "숫자 값"이 아니라 자릿수 코드이므로
// 숫자 변환 없이 unformatNumber로 정규화만 하고 string으로 유지한다.
export const toClientSnapshotUpdate = (form: ScheduleClientUpdateForm): ClientSnapshotUpdate => ({
  name: trimValue(form.name),
  bizNumber: unformatNumber(form.bizNumber),
  representative: trimValue(form.representative),
  zipcode: form.zipcode,
  roadAddress: form.roadAddress,
  detailAddress: trimValue(form.detailAddress),
  email: trimValue(form.email),
  tel: unformatNumber(form.tel),
  workplace: {
    name: trimValue(form.workplaceName),
    bizNumber: unformatNumber(form.workplaceBizNumber),
    businessCategory: trimValue(form.workplaceBusinessCategory),
    zipcode: form.workplaceZipcode,
    roadAddress: form.workplaceRoadAddress,
    detailAddress: trimValue(form.workplaceDetailAddress),
    grade: form.workplaceGrade,
    stack: {
      field: form.stackField,
      name: trimValue(form.stackName),
      semsNumber: trimValue(form.stackSemsNumber),
      grade: form.stackGrade,
      mainProduct: trimValue(form.mainProduct),
      // 서버가 nullable(Integer/Double)이므로 toNumber(빈값→0)가 아니라 toNumberOrNull을 쓴다.
      // 0으로 보내면 서버가 실제 0을 덮어써 산소보정계수 계산이 어긋난다.
      standardOxygen: toNumberOrNull(form.standardOxygen),
      height: toNumberOrNull(form.height),
      horizontalLength: toNumberOrNull(form.horizontalLength),
      // 원형은 세로 길이가 의미 없으므로 보내지 않는다(null = 기존 값 유지).
      verticalLength: form.shape === "RECTANGULAR" ? toNumberOrNull(form.verticalLength) : null,
      shape: form.shape,
      orientation: form.orientation,
    },
  },
});
