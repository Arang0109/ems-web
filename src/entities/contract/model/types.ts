import type { ContractAmountUnit } from "@shared/model";

export type ContractListItem = {
  id: number;
  workplaceId: number;

  contractName: string;
  clientName: string;
  workplaceName: string;

  contractDate: string;
  taskPeriod: string;
  fields: string;

  contractStatus: string;
}

export type ContractDetail = {
  id: number;
  workplaceId: number;
  contractName: string;
  workplaceName: string;
  clientName: string;
  workplaceAddress: string;

  contractDate: string;
  startDate: string;
  completionDate: string;

  contractAmount: number;
  contractAmountUnit: ContractAmountUnit;
  vatIncluded: boolean;

  contractGuaranteeAmount: number | null;
  advancePaymentAmount: number | null;

  advancePaymentDueDate: number;
  delayPenaltyRate: number;

  remark: string;
}

export type ContractCreate = {
  workplaceId: number;
  contractName: string;

  contractDate: Date;
  startDate: Date;
  completionDate: Date;

  contractAmount: number;
  contractAmountUnit: ContractAmountUnit;
  vatIncluded: boolean;

  contractGuaranteeAmount: number | null;
  advancePaymentAmount: number | null;

  advancePaymentDueDate: number;
  delayPenaltyRate: number;

  remark: string;
}

export type ContractUpdate = {
  contractName: string;

  contractDate: Date;
  startDate: Date;
  completionDate: Date;

  contractAmount: number;
  contractAmountUnit: ContractAmountUnit;
  vatIncluded: boolean;

  contractGuaranteeAmount: number | null;
  advancePaymentAmount: number | null;

  advancePaymentDueDate: number;
  delayPenaltyRate: number;

  remark: string;
}
