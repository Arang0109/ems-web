import type { ClientSnapshotUpdate } from "@entities/schedule";
import { trimValue, unformatNumber } from "@shared/lib";

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
    // stack 을 싣지 않으면 서버 병합이 측정시설을 건드리지 않는다
    // (측정시설 수정은 features/update-schedule-stack 소관).
  },
});
