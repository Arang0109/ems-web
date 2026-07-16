import type { TeamRegisterForm } from "./types";

export const validateTeamFields = (form: TeamRegisterForm) => {
  const errors: Partial<Record<keyof TeamRegisterForm, string>> = {};

  if (!form.name.trim()) errors.name = '팀 이름을 입력해주세요.';
  if (!form.mentorUserId) errors.mentorUserId = '사수를 선택해주세요.';
  if (!form.menteeUserId) errors.menteeUserId = '부사수를 선택해주세요.';
  if (form.mentorUserId && form.menteeUserId && form.mentorUserId === form.menteeUserId) {
    errors.menteeUserId = '사수와 부사수는 서로 달라야 합니다.';
  }
  if (!form.particleSamplerId) errors.particleSamplerId = '입자샘플러를 선택해주세요.';
  if (!form.gasSamplerId) errors.gasSamplerId = '가스샘플러를 선택해주세요.';
  if (!form.pitotTubeId) errors.pitotTubeId = '피토관을 선택해주세요.';
  if (!form.nozzleId) errors.nozzleId = '노즐을 선택해주세요.';

  return errors;
};
