import type { ContractCreate } from "@entities/contract";
import type { ContractRegisterForm } from "./types";

import { trimValue, unformatNumber } from "@shared/lib";

export const mapToDto = (
  form: ContractRegisterForm
): ContractCreate => ({
  workplaceId: form.workplaceId,
  contractName: trimValue(form.contractName),
  contractDate: form.contractDate,
  startDate: form.startDate,
  completionDate: form.completionDate,
  contractAmount: Number(unformatNumber(form.contractAmount)),
  contractAmountUnit: form.contractAmountUnit,
  vatIncluded: form.vatIncluded,
  contractGuaranteeAmount: Number(unformatNumber(form.contractGuaranteeAmount)),
  advancePaymentAmount: Number(unformatNumber(form.advancePaymentAmount)),
  advancePaymentDueDate: form.advancePaymentDueDate,
  delayPenaltyRate: form.delayPenaltyRate,
  remark: trimValue(form.remark),
})
