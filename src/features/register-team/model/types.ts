export type TeamRegisterForm = {
  name: string;
  mentorUserId: string;   // Select 값 (member id)
  menteeUserId: string;
  particleSamplerId: string;
  gasSamplerId: string;
  pitotTubeId: string;
  nozzleId: string;
};

export const getDefaultTeamRegisterForm = (): TeamRegisterForm => ({
  name: '',
  mentorUserId: '',
  menteeUserId: '',
  particleSamplerId: '',
  gasSamplerId: '',
  pitotTubeId: '',
  nozzleId: '',
});
