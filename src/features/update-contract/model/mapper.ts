import type { ContractUpdateRequest } from "@entities/contract";
import type { ContractEditForm } from "./types";

import { trimValue, unformatMoney } from "@shared/lib/formatters";

export const mapToUpdateDto = (form: ContractEditForm): ContractUpdateRequest => ({
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
});
