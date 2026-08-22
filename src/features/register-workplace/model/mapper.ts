import type { WorkplaceRegisterForm } from "./types";
import type { WorkplaceCreate } from "@entities/workplace";

import { unformatNumber, trimValue } from "@shared/lib";

export const toWorkplaceCreate = (
  form: WorkplaceRegisterForm
): WorkplaceCreate => ({
  clientId: form.clientId,
  name: trimValue(form.workplaceName),
  bizNumber: unformatNumber(form.workplaceBizNumber),
  businessCategory: trimValue(form.workplaceBusinessCategory),
  zipcode: form.workplaceZipcode,
  roadAddress: form.workplaceRoadAddress,
  address: trimValue(form.workplaceDetailAddress),
  facilityManager: trimValue(form.facilityManager),
  samplingWitness: trimValue(form.samplingWitness),
  grade: form.grade,
});