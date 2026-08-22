import type { Team } from "@entities/team";

import { toFormValue } from "@shared/lib";

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
    mentorUserId: toFormValue(team.mentorUserId),
    menteeUserId: toFormValue(team.menteeUserId),
    particleSamplerId: team.particleSamplerId ?? '',
    gasSamplerId: team.gasSamplerId ?? '',
    pitotTubeId: team.pitotTubeId ?? '',
    nozzleId: team.nozzleId ?? '',
  };
};
