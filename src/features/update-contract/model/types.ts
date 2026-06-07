import type { ContractAmountUnit, ContractResponse } from "@entities/contract";

export type ContractEditForm = {
  // 읽기 전용 (UI 표시만, DTO에 포함되지 않음)
  companyName: string;
  workplaceName: string;
  workplaceAddress: string;

  // 수정 가능
  contractName: string;
  contractDate: Date;
  startDate: Date;
  completionDate: Date;
  contractAmount: number;
  contractAmountUnit: ContractAmountUnit;
  vatIncluded: boolean;
  contractGuaranteeAmount: number;
  advancePaymentAmount: number;
  advancePaymentDueDate: number;
  delayPenaltyRate: number;
  remark: string;
};

export const getDefaultContractEditForm = (): ContractEditForm => ({
  companyName: "",
  workplaceName: "",
  workplaceAddress: "",
  contractName: "",
  contractDate: new Date(),
  startDate: new Date(),
  completionDate: new Date(),
  contractAmount: 0,
  contractAmountUnit: "TOTAL",
  vatIncluded: false,
  contractGuaranteeAmount: 0,
  advancePaymentAmount: 0,
  advancePaymentDueDate: 0,
  delayPenaltyRate: 0,
  remark: "",
});

export const mapFromResponse = (r: ContractResponse): ContractEditForm => ({
  companyName: r.companyName,
  workplaceName: r.workplaceName,
  workplaceAddress: r.workplaceAddress,
  contractName: r.contractName,
  contractDate: new Date(r.contractDate),
  startDate: new Date(r.startDate),
  completionDate: new Date(r.completionDate),
  contractAmount: r.contractAmount,
  contractAmountUnit: r.contractAmountUnit,
  vatIncluded: r.vatIncluded,
  contractGuaranteeAmount: r.contractGuaranteeAmount,
  advancePaymentAmount: r.advancePaymentAmount,
  advancePaymentDueDate: r.advancePaymentDueDate,
  delayPenaltyRate: r.delayPenaltyRate,
  remark: r.remark,
});

export const VAT_INCLUDED_LABEL = {
  true: "포함",
  false: "미포함",
} as const;
