import type { WorkplaceRegisterForm } from "./types";
import type { WorkplaceCreate } from "@entities/workplace";

import { unformatNumber, trimValue } from "@shared/lib";

export const toWorkplaceCreate = (
  form: WorkplaceRegisterForm
): WorkplaceCreate => ({
  clientId: form.clientId,
  name: trimValue(form.workplaceName),
  bizNumber: unformatNumber(form.workplaceBizNumber),
  zipcode: form.workplaceZipcode,
  roadAddress: form.workplaceRoadAddress,
  address: trimValue(form.workplaceAddress),
  grade: form.grade,
});