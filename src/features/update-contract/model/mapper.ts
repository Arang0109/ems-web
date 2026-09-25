import type { ContractUpdate, ContractDetail } from "@entities/contract";
import type { ContractUpdateForm } from "./types";

import { trimValue, toNumber, toNumberOrNull, toFormValue, toPickerDate } from "@shared/lib";

export const toContractUpdate = (form: ContractUpdateForm): ContractUpdate => ({
  contractName: trimValue(form.contractName),
  contractDate: form.contractDate,
  startDate: form.startDate,
  completionDate: form.completionDate,
  contractAmount: toNumber(form.contractAmount),
  contractAmountUnit: form.contractAmountUnit,
  vatIncluded: form.vatIncluded,
  contractGuaranteeAmount: toNumberOrNull(form.contractGuaranteeAmount),
  advancePaymentAmount: toNumberOrNull(form.advancePaymentAmount),
  advancePaymentDueDate: toNumber(form.advancePaymentDueDate),
  delayPenaltyRate: toNumber(form.delayPenaltyRate),
  remark: trimValue(form.remark),
});

export const toContractUpdateForm = (detail: ContractDetail): ContractUpdateForm => ({
  clientName: detail.clientName,
  workplaceName: detail.workplaceName,
  workplaceAddress: detail.workplaceAddress,
  contractName: detail.contractName,
  contractDate: toPickerDate(detail.contractDate) ?? new Date(),
  startDate: toPickerDate(detail.startDate) ?? new Date(),
  completionDate: toPickerDate(detail.completionDate) ?? new Date(),
  contractAmount: toFormValue(detail.contractAmount),
  contractAmountUnit: detail.contractAmountUnit,
  vatIncluded: detail.vatIncluded,
  contractGuaranteeAmount: toFormValue(detail.contractGuaranteeAmount),
  advancePaymentAmount: toFormValue(detail.advancePaymentAmount),
  advancePaymentDueDate: toFormValue(detail.advancePaymentDueDate),
  delayPenaltyRate: toFormValue(detail.delayPenaltyRate),
  remark: detail.remark,
});
