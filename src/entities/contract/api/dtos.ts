import type { ContractAmountUnit } from "../model/types";

export type ContractTableResponse = {
  id: number;
  workplaceId: number;

  contractName: string;
  companyName: string;
  workplaceName: string;  

  contractDate: string;            // 용역명
  taskPeriod: string;
  fields: string;

  contractStatus: string;      // 계약일자
}

export type ContractRegisterRequest = {
  workplaceId: string;               // 사업장 ID
  contractName: string;              // 용역명

  contractDate: Date;             // 계약일자
  startDate: Date;                // 착수일자
  completionDate: Date;           // 완수일자

  contractAmount: number;           // 계약금액
  contractAmountUnit: ContractAmountUnit;
  vatIncluded: boolean;             // 부가세 여부

  contractGuaranteeAmount: number;  // 계약보증금
  advancePaymentAmount: number;     // 선금

  advancePaymentDueDate: number;    // 선급지급기간
  delayPenaltyRate: number;         // 지체상금율 (%)

  remark: string;                   // 비고
}