import type { ContractRegisterRequest } from "@entities/contract";
import type { ContractRegisterForm } from "./types";

import { trimValue, unformatMoney } from "@shared/lib/formatters";

export const mapToDto = (
  form: ContractRegisterForm
): ContractRegisterRequest => ({
  workplaceId: form.workplaceId,
  contractName: trimValue(form.contractName),
  contractDate: form.contractDate,
  startDate: form.startDate,
  completionDate: form.completionDate,
  contractAmount: unformatMoney(form.contractAmount),
  contractAmountUnit: form.contractAmountUnit,
  vatIncluded: form.vatIncluded,
  contractGuaranteeAmount: unformatMoney(form.contractGuaranteeAmount),
  advancePaymentAmount: unformatMoney(form.advancePaymentAmount),
  advancePaymentDueDate: form.advancePaymentDueDate,
  delayPenaltyRate: form.delayPenaltyRate,
  remark: trimValue(form.remark),
})
