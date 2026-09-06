import type { EquipType } from "@shared/model";

// 이 폼이 슬롯으로 다루는 장비 유형. 나머지 유형(가스분석기·기타)은 화면에 없지만
// 저장이 전체 교체라 배정을 유지하려면 함께 보내야 한다(mapper 의 keepIds).
export const MANAGED_EQUIP_TYPES: EquipType[] =
  ["PARTICLE_SAMPLER", "GAS_SAMPLER", "PITOT_TUBE", "NOZZLE"];

// 장비 식별자는 서버 계약이 String이므로 Form도 string(Select 값)이다.
// 미배정은 "".
export type ScheduleEquipmentsUpdateForm = {
  particleSamplerId: string;
  gasSamplerId: string;
  pitotTubeId: string;
  nozzleId: string;
};

export const getDefaultForm = (): ScheduleEquipmentsUpdateForm => ({
  particleSamplerId: "",
  gasSamplerId: "",
  pitotTubeId: "",
  nozzleId: "",
});
