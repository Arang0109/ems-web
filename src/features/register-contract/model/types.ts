import type { ContractAmountUnit } from "@entities/contract";

export type ContractRegisterForm = {
  workplaceId: string;           // 측정대상 사업장
  workplaceName: string;         // 사업장명 (선택된 사업장에 따라 자동 입력)
  workplaceAddress: string;      // 사업장 소재지 (선택된 사업장에 따라 자동 입력)
  contractName: string;              // 용역명

  contractDate: Date;             // 계약일자
  startDate: Date;                // 착수일자
  completionDate: Date;           // 완수일자

  contractAmount: string;           // 계약금액
  contractAmountUnit: ContractAmountUnit;
  vatIncluded: boolean;             // 부가세 여부

  contractGuaranteeAmount: string;  // 계약보증금
  advancePaymentAmount: string;     // 선금

  advancePaymentDueDate: number;    // 선급지급기간
  delayPenaltyRate: number;         // 지체상금율 (%)

  remark: string;                   // 비고
}

export const getDefaultContractForm = (): ContractRegisterForm => ({
  workplaceId: "",
  workplaceName: "",
  workplaceAddress: "",
  contractName: "",

  contractDate: new Date(),
  startDate: new Date(),
  completionDate: new Date(),

  contractAmount: "",
  contractAmountUnit: 'TOTAL',
  vatIncluded: false,

  contractGuaranteeAmount: "",
  advancePaymentAmount: "",

  advancePaymentDueDate: 0,
  delayPenaltyRate: 0,

  remark: "",
});
