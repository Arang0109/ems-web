import type { Team } from "@entities/team";

export type TeamUpdateForm = {
  name: string;
  mentorUserId: string;
  menteeUserId: string;
  particleSamplerId: string;
  gasSamplerId: string;
  pitotTubeId: string;
  nozzleId: string;
};

export const getDefaultForm = (team: Team | null): TeamUpdateForm => {
  if (!team) {
    return {
      name: '', mentorUserId: '', menteeUserId: '',
      particleSamplerId: '', gasSamplerId: '', pitotTubeId: '', nozzleId: '',
    };
  }

  return {
    name: team.name ?? '',
    mentorUserId: team.mentorUserId != null ? String(team.mentorUserId) : '',
    menteeUserId: team.menteeUserId != null ? String(team.menteeUserId) : '',
    particleSamplerId: team.particleSamplerId ?? '',
    gasSamplerId: team.gasSamplerId ?? '',
    pitotTubeId: team.pitotTubeId ?? '',
    nozzleId: team.nozzleId ?? '',
  };
};
