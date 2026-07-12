import type { ContractCreate } from "@entities/contract";
import type { WorkplaceListItem } from "@entities/workplace";

import type { ContractRegisterForm } from "./types";

import { trimValue, toNumber } from "@shared/lib";

export const toContractCreate = (
  form: ContractRegisterForm
): ContractCreate => ({
  workplaceId: Number(form.workplaceId),
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

export const toWorkplaceOptions = (
  workplaces: WorkplaceListItem[]
) => {
  return workplaces.map(wp => ({
    value: String(wp.id),
    label: wp.workplaceName,
  }));
};