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
