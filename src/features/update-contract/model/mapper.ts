import type { ContractUpdate, ContractDetail } from "@entities/contract";
import type { ContractUpdateForm } from "./types";

import { trimValue, unformatNumber } from "@shared/lib";

export const toContractUpdate = (form: ContractUpdateForm): ContractUpdate => ({
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

export const toContractUpdateForm = (detail: ContractDetail): ContractUpdateForm => ({
  companyName: detail.companyName,
  workplaceName: detail.workplaceName,
  workplaceAddress: detail.workplaceAddress,
  contractName: detail.contractName,
  contractDate: new Date(detail.contractDate),
  startDate: new Date(detail.startDate),
  completionDate: new Date(detail.completionDate),
  contractAmount: String(detail.contractAmount),
  contractAmountUnit: detail.contractAmountUnit,
  vatIncluded: detail.vatIncluded,
  contractGuaranteeAmount: String(detail.contractGuaranteeAmount),
  advancePaymentAmount: String(detail.advancePaymentAmount),
  advancePaymentDueDate: detail.advancePaymentDueDate,
  delayPenaltyRate: detail.delayPenaltyRate,
  remark: detail.remark,
});
