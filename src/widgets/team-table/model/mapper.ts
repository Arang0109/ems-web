import type { Team } from "@entities/team";

import type { TeamTableRow } from "./types";

export const toTeamRows = (col: Team): TeamTableRow => ({
  id: col.id,
  name: col.name,
  mentorName: col.mentorName,
  menteeName: col.menteeName,
});
