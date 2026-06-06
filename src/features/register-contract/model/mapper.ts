import type { ContractRegisterRequest } from "@entities/contract";
import type { ContractRegisterForm } from "./types";

import { trimValue, toDateString } from "@shared/lib/formatters";

export const mapToDto = (
  form: ContractRegisterForm
): ContractRegisterRequest => ({
  workplaceId: form.workplaceId,
  contractName: trimValue(form.contractName),
  contractDate: toDateString(form.contractDate),
  startDate: toDateString(form.startDate),
  completionDate: toDateString(form.completionDate),
  contractAmount: form.contractAmount,
  contractAmountUnit: form.contractAmountUnit,
  vatIncluded: form.vatIncluded,
  contractGuaranteeAmount: form.contractGuaranteeAmount,
  advancePaymentAmount: form.advancePaymentAmount,
  advancePaymentDueDate: form.advancePaymentDueDate,
  delayPenaltyRate: form.delayPenaltyRate,
  remark: trimValue(form.remark),
})