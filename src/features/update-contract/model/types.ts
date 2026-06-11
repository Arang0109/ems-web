import type { ContractAmountUnit } from "@entities/contract";

export type ContractUpdateForm = {
  // 읽기 전용 (UI 표시만, DTO에 포함되지 않음)
  companyName: string;
  workplaceName: string;
  workplaceAddress: string;

  // 수정 가능
  contractName: string;
  contractDate: Date;
  startDate: Date;
  completionDate: Date;
  contractAmount: string;
  contractAmountUnit: ContractAmountUnit;
  vatIncluded: boolean;
  contractGuaranteeAmount: string;
  advancePaymentAmount: string;
  advancePaymentDueDate: number;
  delayPenaltyRate: number;
  remark: string;
};

export const getDefaultContractUpdateForm = (): ContractUpdateForm => ({
  companyName: "",
  workplaceName: "",
  workplaceAddress: "",
  contractName: "",
  contractDate: new Date(),
  startDate: new Date(),
  completionDate: new Date(),
  contractAmount: "",
  contractAmountUnit: "TOTAL",
  vatIncluded: false,
  contractGuaranteeAmount: "",
  advancePaymentAmount: "",
  advancePaymentDueDate: 0,
  delayPenaltyRate: 0,
  remark: "",
});
