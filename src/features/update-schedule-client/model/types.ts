import type { Grade } from "@shared/model";

// 의뢰기관→사업장 두 계층을 한 폼에서 다루므로, 필드명이 겹치는 사업장에는
// 접두어를 붙여 평탄하게 둔다. fieldErrors(keyof 기반)를 그대로 쓰기 위한 구조다.
// 측정시설은 카드가 따로 있어 수정도 따로 한다 — features/update-schedule-stack 참고.
export type ScheduleClientUpdateForm = {
  // 의뢰기관
  name: string;
  bizNumber: string;
  representative: string;
  zipcode: string;
  roadAddress: string;
  detailAddress: string;
  email: string;
  tel: string;
  // 사업장
  workplaceName: string;
  workplaceBizNumber: string;
  workplaceBusinessCategory: string;
  workplaceGrade: Grade;
  workplaceZipcode: string;
  workplaceRoadAddress: string;
  workplaceDetailAddress: string;
};

export const getDefaultForm = (): ScheduleClientUpdateForm => ({
  name: "",
  bizNumber: "",
  representative: "",
  zipcode: "",
  roadAddress: "",
  detailAddress: "",
  email: "",
  tel: "",
  workplaceName: "",
  workplaceBizNumber: "",
  workplaceBusinessCategory: "",
  workplaceGrade: "TYPE_1",
  workplaceZipcode: "",
  workplaceRoadAddress: "",
  workplaceDetailAddress: "",
});
