import type { TeamUpdateForm } from "./types";
import type { TeamUpdate } from "@entities/team";

import { trimValue } from "@shared/lib";

export const toTeamUpdate = (form: TeamUpdateForm): TeamUpdate => ({
  name: trimValue(form.name),
  mentorUserId: Number(form.mentorUserId),
  menteeUserId: Number(form.menteeUserId),
  particleSamplerId: form.particleSamplerId,
  gasSamplerId: form.gasSamplerId,
  pitotTubeId: form.pitotTubeId,
  nozzleId: form.nozzleId,
});
