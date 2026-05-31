export type Contract = {
  id: number;
  contractName: string;              // 용역명

  contractDate: string;             // 계약일자
  startDate: string;                // 착수일자
  completionDate: string;           // 완수일자

  contractAmount: number;           // 계약금액
  vatIncluded: boolean;             // 부가세 여부

  contractGuaranteeAmount: number;  // 계약보증금
  advancePaymentAmount: number;     // 선금

  advancePaymentDueDate: string;    // 선급지급기간
  delayPenaltyRate: number;         // 지체상금율 (%)

  remark: string;                   // 비고
}