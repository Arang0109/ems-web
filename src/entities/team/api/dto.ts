export type TeamResponse = {
  id: number;
  name: string;
  mentorUserId: number;      // 사수 (member id)
  mentorName: string;        // 서버가 조립해 채움
  menteeUserId: number;      // 부사수 (member id)
  menteeName: string;
  particleSamplerId: string; // 장비 id (equipment ObjectId 문자열)
  gasSamplerId: string;
  pitotTubeId: string;
  nozzleId: string;
};

export type TeamRegisterRequest = {
  name: string;
  mentorUserId: number;
  menteeUserId: number;
  particleSamplerId: string;
  gasSamplerId: string;
  pitotTubeId: string;
  nozzleId: string;
};

export type TeamUpdateRequest = TeamRegisterRequest;
