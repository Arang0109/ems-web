import type { ContractUpdateRequest } from "@entities/contract";
import { trimValue } from "@shared/lib/formatters";

import type { ContractEditForm } from "./types";

export const mapToUpdateDto = (form: ContractEditForm): ContractUpdateRequest => ({
  contractName: trimValue(form.contractName),
  contractDate: form.contractDate,
  startDate: form.startDate,
  completionDate: form.completionDate,
  contractAmount: form.contractAmount,
  contractAmountUnit: form.contractAmountUnit,
  vatIncluded: form.vatIncluded,
  contractGuaranteeAmount: form.contractGuaranteeAmount,
  advancePaymentAmount: form.advancePaymentAmount,
  advancePaymentDueDate: form.advancePaymentDueDate,
  delayPenaltyRate: form.delayPenaltyRate,
  remark: trimValue(form.remark),
});
