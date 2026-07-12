import type { ContractUpdate, ContractDetail } from "@entities/contract";
import type { ContractUpdateForm } from "./types";

import { trimValue, toNumber } from "@shared/lib";

export const toContractUpdate = (form: ContractUpdateForm): ContractUpdate => ({
  contractName: trimValue(form.contractName),
  contractDate: form.contractDate,
  startDate: form.startDate,
  completionDate: form.completionDate,
  contractAmount: toNumber(form.contractAmount),
  contractAmountUnit: form.contractAmountUnit,
  vatIncluded: form.vatIncluded,
  contractGuaranteeAmount: toNumber(form.contractGuaranteeAmount),
  advancePaymentAmount: toNumber(form.advancePaymentAmount),
  advancePaymentDueDate: toNumber(form.advancePaymentDueDate),
  delayPenaltyRate: toNumber(form.delayPenaltyRate),
  remark: trimValue(form.remark),
});

export const toContractUpdateForm = (detail: ContractDetail): ContractUpdateForm => ({
  clientName: detail.clientName,
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
  advancePaymentDueDate: String(detail.advancePaymentDueDate),
  delayPenaltyRate: String(detail.delayPenaltyRate),
  remark: detail.remark,
});
