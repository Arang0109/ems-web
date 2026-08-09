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

export type Contract = {
  id: number;
  workplaceId: string;               // 사업장 ID
  contractName: string;              // 용역명

  contractDate: string;             // 계약일자
  startDate: string;                // 착수일자
  completionDate: string;           // 완수일자

  contractAmount: number;           // 계약금액
  contractAmountUnit: ContractAmountUnit;
  vatIncluded: boolean;             // 부가세 여부

  contractGuaranteeAmount: number | null;  // 계약보증금
  advancePaymentAmount: number | null;     // 선금

  advancePaymentDueDate: string;    // 선급지급기간
  delayPenaltyRate: number;         // 지체상금율 (%)

  remark: string;                   // 비고
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

export const CONTRACT_AMOUNT_UNIT =['MONTH', 'QUARTER', 'SEMI_ANNUAL', 'ANNUAL', 'TOTAL'] as const;

export type ContractAmountUnit = typeof CONTRACT_AMOUNT_UNIT[number];

export const CONTRACT_AMOUNT_UNIT_LABEL: Record<ContractAmountUnit, string> = {
  MONTH: '월',
  QUARTER: '분기',
  SEMI_ANNUAL: '반기',
  ANNUAL: '연',
  TOTAL: "총액"
};

export const contractAmountUnitOptions = CONTRACT_AMOUNT_UNIT.map((v) => ({
  value: v,
  label: CONTRACT_AMOUNT_UNIT_LABEL[v]
}));

export const VAT_INCLUDED_LABEL = {
  true: '포함',
  false: '미포함',
} as const;