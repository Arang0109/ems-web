import type { TeamRegisterForm } from "./types";
import type { TeamCreate } from "@entities/team";

import { trimValue } from "@shared/lib";

export const toTeamCreate = (form: TeamRegisterForm): TeamCreate => ({
  name: trimValue(form.name),
  mentorUserId: Number(form.mentorUserId),
  menteeUserId: Number(form.menteeUserId),
  particleSamplerId: form.particleSamplerId,
  gasSamplerId: form.gasSamplerId,
  pitotTubeId: form.pitotTubeId,
  nozzleId: form.nozzleId,
});
