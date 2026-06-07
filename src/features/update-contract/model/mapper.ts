import type { ContractUpdate } from "@entities/contract";
import type { ContractEditForm } from "./types";

import { trimValue, unformatNumber } from "@shared/lib";

export const mapToUpdateDto = (form: ContractEditForm): ContractUpdate => ({
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
});
