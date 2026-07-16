import type { TeamResponse } from "../api/dto";

export type Team = TeamResponse;

export type TeamCreate = {
  name: string;
  mentorUserId: number;
  menteeUserId: number;
  particleSamplerId: string;
  gasSamplerId: string;
  pitotTubeId: string;
  nozzleId: string;
};

export type TeamUpdate = TeamCreate;
