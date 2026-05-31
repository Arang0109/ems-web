export type ContractRegisterForm = {
  contractName: string;              // 용역명

  contractDate: Date;             // 계약일자
  startDate: Date;                // 착수일자
  completionDate: Date;           // 완수일자

  contractAmount: number;           // 계약금액
  vatIncluded: boolean;             // 부가세 여부

  contractGuaranteeAmount: number;  // 계약보증금
  advancePaymentAmount: number;     // 선금

  advancePaymentDueDate: number;    // 선급지급기간
  delayPenaltyRate: number;         // 지체상금율 (%)

  remark: string;                   // 비고
}

export const getDefaultContractForm = (): ContractRegisterForm => ({
  contractName: "",

  contractDate: new Date(),
  startDate: new Date(),
  completionDate: new Date(),

  contractAmount: 0,
  vatIncluded: false,

  contractGuaranteeAmount: 0,
  advancePaymentAmount: 0,

  advancePaymentDueDate: 0,
  delayPenaltyRate: 0,

  remark: "",
})